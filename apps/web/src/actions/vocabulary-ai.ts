'use server';

import { generateText } from '@/lib/ai';
import { db } from '@/db/client';
import { vocabularies, vocabularyRelations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const VocabularySchema = z.object({
  word: z.string(),
  meaning: z.string(),
  partOfSpeech: z.string().optional(),
  language: z.string().default('en'),
  type: z.string().optional(), // For relations
  pronunciation: z.string().optional(),
  example: z.string().optional(),
});

const AIResponseSchema = z.object({
  rootWord: VocabularySchema,
  family: z.array(VocabularySchema),
});

export async function generateVocabularyPreview(
  wordInput: string,
  options: {
    includeFamily?: boolean;
    includeSynonyms?: boolean;
    includeAntonyms?: boolean;
  } = {
    includeFamily: true,
    includeSynonyms: true,
    includeAntonyms: true,
  }
) {
  try {
    const prompt = `
      Act as an expert IELTS Vocabulary Teacher.
      Analyze the word "${wordInput}".
      
      1.  **Identify the Root Word**: Determine the root/base form of the input word.
      2.  **Analyze the Root Word**:
          *   **Meaning**: Provide a clear, concise definition suitable for an IELTS learner (English).
          *   **Part of Speech**: e.g., Noun, Verb, Adjective.
          *   **IPA Pronunciation**: Provide the IPA transcription (e.g., /wɜːd/).
          *   **Example**: Provide a sophisticated example sentence demonstrating its usage in an academic or formal context (IELTS style).
      3.  **Generate Word Family & Synonyms**:
          ${
            options.includeFamily
              ? '*   List important related words (derivatives, forms) in the same family.'
              : ''
          }
          ${
            options.includeSynonyms
              ? '*   **CRITICAL**: List **Synonyms** if applicable.'
              : ''
          }
          ${
            options.includeAntonyms
              ? '*   **CRITICAL**: List **Antonyms** if applicable.'
              : ''
          }
          *   For each, provide Meaning, Part of Speech, and **Type** (derivative, synonym, antonym).
      
      4.  **Return JSON**:
      {
        "rootWord": {
          "word": "root_word",
          "meaning": "definition",
          "partOfSpeech": "noun",
          "language": "en", // Detect the language (en, ko, zh, etc.)
          "pronunciation": "/ipa/",
          "example": "sentence"
        },
        "family": [
          {
            "word": "related_word",
            "meaning": "definition",
            "partOfSpeech": "adj",
            "type": "derivative" // or "synonym" or "antonym"
          }
        ]
      }
      Ensure valid JSON. No markdown.
    `;

    const text = await generateText(prompt);
    console.log('AI Raw Response:', text);

    // Clean up potential markdown code blocks if the model includes them
    const cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const data = JSON.parse(cleanText);
    const parsedData = AIResponseSchema.parse(data);

    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Error generating vocabulary preview:', error);
    if (error instanceof z.ZodError) {
      console.error(
        'Zod Validation Error:',
        JSON.stringify(error.issues, null, 2)
      );
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate vocabulary preview',
    };
  }
}

export async function saveVocabularyFamily(
  data: z.infer<typeof AIResponseSchema>,
  sourceWord?: string
) {
  try {
    // 1. Determine Source ID (either provided sourceWord or the rootWord from AI)
    let sourceId: string;

    if (sourceWord) {
      const existingSource = await db.query.vocabularies.findFirst({
        where: eq(vocabularies.word, sourceWord),
      });
      if (!existingSource) {
        throw new Error(`Source word "${sourceWord}" not found in database`);
      }
      sourceId = existingSource.id;
    } else {
      // Default behavior: Use rootWord from AI as source
      const existingRoot = await db.query.vocabularies.findFirst({
        where: eq(vocabularies.word, data.rootWord.word),
      });

      if (existingRoot) {
        sourceId = existingRoot.id;
      } else {
        const [newRoot] = await db
          .insert(vocabularies)
          .values({
            word: data.rootWord.word,
            meaning: data.rootWord.meaning,
            partOfSpeech: data.rootWord.partOfSpeech,
            language: data.rootWord.language,
            pronunciation: data.rootWord.pronunciation,
            example: data.rootWord.example,
          })
          .returning();
        sourceId = newRoot.id;
      }
    }

    // 2. Ensure Root Word exists (if it's different from source)
    // Even if we use sourceWord, we still want to save the rootWord if it's new
    if (sourceWord && sourceWord !== data.rootWord.word) {
      let rootId: string;
      const existingRoot = await db.query.vocabularies.findFirst({
        where: eq(vocabularies.word, data.rootWord.word),
      });

      if (existingRoot) {
        rootId = existingRoot.id;
      } else {
        const [newRoot] = await db
          .insert(vocabularies)
          .values({
            word: data.rootWord.word,
            meaning: data.rootWord.meaning,
            partOfSpeech: data.rootWord.partOfSpeech,
            language: data.rootWord.language,
            pronunciation: data.rootWord.pronunciation,
            example: data.rootWord.example,
          })
          .returning();
        rootId = newRoot.id;
      }

      // Link Source -> Root (as 'root' or 'related')
      const existingRelation = await db.query.vocabularyRelations.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.sourceId, sourceId),
            eq(table.targetId, rootId),
            eq(table.type, 'root')
          ),
      });

      if (!existingRelation) {
        await db.insert(vocabularyRelations).values({
          sourceId: sourceId,
          targetId: rootId,
          type: 'root',
        });
      }
    }

    // 2. Handle Family Members
    for (const item of data.family) {
      // Skip if it's the root word itself (just in case)
      if (item.word === data.rootWord.word) continue;

      let wordId: string;
      const existingWord = await db.query.vocabularies.findFirst({
        where: eq(vocabularies.word, item.word),
      });

      if (existingWord) {
        wordId = existingWord.id;
      } else {
        const [newWord] = await db
          .insert(vocabularies)
          .values({
            word: item.word,
            meaning: item.meaning,
            partOfSpeech: item.partOfSpeech,
            language: data.rootWord.language,
          })
          .returning();
        wordId = newWord.id;
      }

      // 3. Create Relation (if not exists)
      const existingRelation = await db.query.vocabularyRelations.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.sourceId, sourceId),
            eq(table.targetId, wordId),
            eq(table.type, item.type || 'related')
          ),
      });

      if (!existingRelation) {
        await db.insert(vocabularyRelations).values({
          sourceId: sourceId,
          targetId: wordId,
          type: item.type || 'related',
        });
      }
    }

    return { success: true, rootWord: data.rootWord.word };
  } catch (error) {
    console.error('Error saving vocabulary family:', error);
    return { success: false, error: 'Failed to save vocabulary family' };
  }
}

export async function checkVocabulary(word: string) {
  try {
    // 1. Check if word exists in DB
    const existingWord = await db.query.vocabularies.findFirst({
      where: (table, { eq, or, sql }) =>
        sql`lower(${table.word}) = lower(${word})`,
    });

    if (existingWord) {
      return {
        exists: true,
        data: {
          rootWord: existingWord,
          // We could fetch relations here if needed, but for now just the root is enough to show it exists
        },
      };
    }

    // 2. If not exists, check validity with AI
    const prompt = `
      Is "${word}" a valid word in English?
      Answer with a JSON object: { "valid": boolean, "reason": "short explanation" }
      Do not include markdown formatting.
    `;

    const text = (await generateText(prompt))
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const validation = JSON.parse(text);

    return {
      exists: false,
      valid: validation.valid,
      reason: validation.reason,
    };
  } catch (error) {
    console.error('Error checking vocabulary:', error);
    return {
      exists: false,
      valid: false,
      error: 'Failed to check vocabulary',
    };
  }
}
