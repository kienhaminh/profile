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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Vocabulary Manager
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
              <span className="text-[10px] font-medium text-teal-500 uppercase tracking-wide">
                Practice
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
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
