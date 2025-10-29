import { db } from '../src/db';
import { authorProfiles, projects, technologies } from '../src/db/schema';

async function verify(): Promise<void> {
  const authors = await db.select().from(authorProfiles);
  const projs = await db.select().from(projects);
  const techs = await db.select().from(technologies);

  console.log('✅ Verification Results:');
  console.log('  Authors:', authors.length);
  console.log('  Projects:', projs.length);
  console.log('  Technologies:', techs.length);

  if (authors.length > 0) {
    console.log('\n📝 Sample author:');
    console.log('  Name:', authors[0].name);
    console.log('  Email:', authors[0].email);
  }

  if (projs.length > 0) {
    console.log('\n📦 Sample projects:');
    projs.slice(0, 3).forEach((p) => {
      console.log(`  - ${p.title} (${p.slug})`);
    });
  }

  if (techs.length > 0) {
    console.log('\n🔧 Sample technologies:');
    techs.slice(0, 5).forEach((t) => {
      console.log(`  - ${t.name}`);
    });
  }
}

verify()
  .then(() => {
    console.log('\n✅ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
