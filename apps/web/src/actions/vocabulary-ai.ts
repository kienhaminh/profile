'use server';

import { model } from '@/lib/ai';
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

export async function generateVocabularyPreview(wordInput: string) {
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
          *   List important related words (derivatives, forms) in the same family.
          *   **CRITICAL**: List **Synonyms** and **Antonyms** if applicable.
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

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
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
  data: z.infer<typeof AIResponseSchema>
) {
  try {
    // 1. Handle Root Word
    let rootWordId: string;
    const existingRoot = await db.query.vocabularies.findFirst({
      where: eq(vocabularies.word, data.rootWord.word),
    });

    if (existingRoot) {
      rootWordId = existingRoot.id;
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
      rootWordId = newRoot.id;
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
            eq(table.sourceId, rootWordId),
            eq(table.targetId, wordId),
            eq(table.type, item.type || 'related')
          ),
      });

      if (!existingRelation) {
        await db.insert(vocabularyRelations).values({
          sourceId: rootWordId,
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
