import { getVocabularies } from '@/actions/vocabulary';
import { VocabularyForm } from '@/components/admin/vocabulary/VocabularyForm';

import { VocabularyList } from '@/components/admin/vocabulary/VocabularyList';
import { FlashcardView } from '@/components/admin/vocabulary/FlashcardView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function VocabularyPage() {
  const { data: vocabularies } = await getVocabularies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vocabulary</h1>
          <p className="text-muted-foreground">
            Manage your vocabulary list and practice with flashcards.
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add">Add New</TabsTrigger>

          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <VocabularyForm />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <VocabularyList initialData={vocabularies || []} />
        </TabsContent>

        <TabsContent value="flashcards">
          <FlashcardView data={vocabularies || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
