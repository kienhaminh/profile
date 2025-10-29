import { db } from '../src/db';
import {
  authorProfiles,
  technologies,
  projects,
  projectTechnologies,
} from '../src/db/schema';
import { eq } from 'drizzle-orm';
import {
  parseNotionCvToAuthor,
  parseNotionCvToProjects,
} from '../src/services/migration/notion-cv-mapper';
import { generateSlug } from '../src/lib/slug';

/**
 * Seed script to import CV data from Notion into database
 * Upserts author profile, technologies, and projects
 */

// Notion CV content (from Notion API fetch)
const NOTION_CV_MD = `
<page url="{{https://www.notion.so/10949a6b2e9f4f0f8b9b28536960939a}}">
<ancestor-path>
<parent-page url="{{https://www.notion.so/5d81defd38184058a10a451cf8f9ba85}}" title=""/>
<ancestor-2-page url="{{https://www.notion.so/ef458ab040d24c4789b25508935d23a9}}" title=""/>
<ancestor-3-page url="{{https://www.notion.so/da21896cdc4e4487a62b835370210a2e}}" title="Personal Home"/>
</ancestor-path>
<properties>
{"title":"KIEN HA MINH"}
</properties>
<content>
<columns>
	<column>
		<image source="{{https://prod-files-secure.s3.us-west-2.amazonaws.com/88a74921-f561-401d-aada-fc5b576fe585/bdedd669-3073-4f07-95c8-4306b65c0ee0/Image.jpg}}"></image>
	</column>
	<column>
		### Full Stack Developer
		---
		**Address**: K12/08 Hoang Van Thai Street, Danang
		**Mobile**: 0776978875
		**Email**: minhkien2208@gmail.com
		**Facebook**: [fb.me/haminh.kien]({{https://www.facebook.com/haminh.kien}})
		**LinkedIn**: [linkedin.com/in/haminhkien]({{http://linkedin.com/in/haminhkien}})
		**Github**: [github.com/kienhaminh]({{https://github.com/kienhaminh}})



	</column>
</columns>
<unknown url="{{https://www.notion.so/10949a6b2e9f4f0f8b9b28536960939a#66924519faca454facf3bf467095b709}}" alt="alias"/>
## About me
---
- 6+ years of hands-on experience efficiently coding websites and applications using modern HTML, CSS, and JavaScript, ReactJS. Mostly using NextJS, coupled with Vercel, to build SaaS and E-commerce products, integrate UI libraries such as Ant Design, MUI, Shadcn. Have experience in API Routes building and integrated external APIs. Experienced in both Page Router and App Router configurations.
- 3+ years** **working with NestJS, building codebases, and interacting with popular databases such as MongoDB, MySQL, and PostgreSQL.
- 2+ years of experience in integrate blockchain, web3 to web application, DApp.
- Experienced in building database architecture, system architecture with AWS, Firebase, Supabase.
- Experienced in mobile development, had experience working with React Native. Used to work with other popular mobile frameworks like Flutter.
- Experienced in DevOps: Cloud Infrastructure Design, Configuration Management, CI/CD, Linux-based OS.
- Experienced in building AI integrated system, RAG, AI Agent. Familiar with popular GenAI.
- Experienced in vibe coding and familiar with some popular AI coding tools (Claude Code, Codex, Cursor, Windsurf).
- Experienced in team leading, project management
- Good self-study ability, problem solving, teamwork.
- Love to research new technology, especially AI, Blockchain, and IoT.
## Education
---
<columns>
	<column>
		*Sep 2016 - May 2020*



	</column>
	<column>
		**DANANG UNIVERSITY OF EDUCATION**
		**Major**: Information Technology
		**GPA**: 3.49/4
	</column>
</columns>
<columns>
	<column>
		*Aug 2025 - now*
	</column>
	<column>
		**CHONNAM NATIONAL UNIVERSITY - KOREA**
		**Master's Student in Department of AI Convergence **
		▶ **Main responsibilities**
			- Research on applying AI to medical field.
			- Drug, Alzheimer, Brain age prediction topic.
	</column>
</columns>
## Work experience
---
<columns>
	<column>
		*Sep 2019 - Jul 2025*



	</column>
	<column>
		**NAPA GLOBAL**
		**Full-stack Developer**
		▶ **Main responsibilities**
			- Take part in product development by teams, using some popular technologies such as ReactJS, NextJS, NodeJS, NestJS, AWS, React Native, Python
			- Key of some projects, focusing on system management built on AWS.
			- Research to improve source code quality, and system maintenance. 
			- Technical leader; research to apply new technologies, new trends; solving technical problems; improving products performance.
			- Research to integrate third-party tools or services like Slack, LinkedIn, Telegram, …
			- Research to apply and improve CI/CD flows using Gitlab, Github, AWS 
			- Make some ideas and join in organizing all events in the company like happy birthday, football tournaments, year-end parties,...
			- Research and build the AI integrated software. Implement AI into development processes.
		▶ **Recognition and Gains**
			- Outstanding Staff 2019
			- The staff has various contributions to cultural activities in the company in 2021
	</column>
</columns>
## Skills
---
▶ **Language**
	- English
▶ **Programming language**
	- JavaScript
	- Python
▶ **Framework**
	- ReactJS
	- NextJS
	- React Native
	- NestJS
	- LangChain
	- LangGraph
▶ **Service**
	- AWS
	- Docker
	- Firebase
	- Git
	- Supabase
	- Clerk
	- NextAuth
▶ **Database**
	- MongoDB
	- MySQL
	- PostgreSQL
	- Redis
▶ **Other**
	- Automation Test
	- CD/CD with Github/Gitlab
	- GraphQL
	- Third-party integration such as Slack, LinkedIn, Telegram
## Projects
---
### Ezteam
*Sep 2019 - Feb 2020*
<columns>
	<column>
		**Description**
	</column>
	<column>
		This is a platform that allows business managers can find and manage suitable IT companies to take their projects.
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		8
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Full-stack Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Design and build system
		Build Front-end and Back-end side
		Contribute ideas to web development progress
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		NextJS, NodeJS, AWS (EC2, S3), Github, PostgreSQL, MongoDB
		Adobe XD
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### Koindex
*Feb 2020 - Dec 2020*
<columns>
	<column>
		**Description**
	</column>
	<column>
		This is a crypto exchange place similar to Binance
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		8
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Front-end Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Build the Front-end site as the design
		Solve technical problems
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		ReactJS, Java Servlet, AWS, Cypress (for end-to-end testing), PostgreSQL, Blockchain, Github
		Adobe XD
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### SendFX
*Jan 2021 - Mar 2021*
<columns>
	<column>
		**Description**
	</column>
	<column>
		This is a currency exchange place with high-speed and low cost
		**Website**: [https://www.sendpayments.com]({{https://www.sendpayments.com/}})
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		12



	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Front-end Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Build Front-end side as the designs
		Solve technical problems
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		ReactJS, Gatsby, AWS (EC2, Lambda, Dynamo DB, S3, Amplify, IAM), Python, Gitlab, Gitlab Runner, GraphQL
		Adobe XD
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### Cabineat
*Jun 2021 - Dec 2021*
<columns>
	<column>
		**Description**
	</column>
	<column>
		This is a platform that allows business owners to manage all their shops conveniently and simply
		Create and manage products, categories, and coupons; get reports
		**Apple Store**: [https://apps.apple.com/vn/app/my-cabineat/id1577026016]({{https://apps.apple.com/vn/app/my-cabineat/id1577026016}})
		**Google Store**: [https://play.google.com/store/apps/details?id=com.app.my_cabineat&hl=en&gl=US]({{https://play.google.com/store/apps/details?id=com.app.my_cabineat&hl=en&gl=US}})
		**Website**: [https://my.cabineat.vn]({{https://my.cabineat.vn/sign-in}})
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		4
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Front-end Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Contribute to building system
		Build and maintain Front-end site on both website and mobile as the designs
		Solve technical problems
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		NextJS, React Native, Airtable (using as DB), Notion (using as DB), NestJS, PostgreSQL, Firebase
		Figma, Cloudinary, SMS service
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### The Martec
*Mar 2021 - Apr 2022*
<columns>
	<column>
		**Description**
	</column>
	<column>
		A platform allows business managers can find and manage suitable candidates who can provide useful articles to use in marketing
		**Website**: [https://www.themartec.com]({{https://www.themartec.com/}})
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		16
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Full-stack Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Build and maintain all sites (Front-end, Back-end, system architecture, third-party integration)
		Manage and maintain AWS system
		Handle hard tasks, improve source code, solve technical problems
		Also, Work as a DevOps
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		ReactJS, NodeJS, PostgreSQL, AWS (EC2, Elastic Beanstalk, S3, Load Balancers, Cloudfront), Github, Github Actions
		Figma
		Slack API, LinkedIn API
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### OSB
Dec *2021 - Apr 2022*
<columns>
	<column>
		**Description**
	</column>
	<column>
		Nearly similar to an NFT marketplace
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		8
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Front-end Technical Leader
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Solve technical problems
		Research and suggest suitable technologies to apply in the project
		Review source code
	</column>
</columns>
<columns>
	<column>
		**Technologies used**



	</column>
	<column>
		NextJS, NestJS, AWS (EC2, S3), MySQL
		Figma
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### Hackathon
*Apr 2022 - Mar 2024*
<columns>
	<column>
		**Description          **
	</column>
	<column>
		A platform allows holding competitions based on Blockchain
		**Website**: [https://crowdhack.io]({{https://crowdhack.io/}})
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		6
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Front-end Technical Leader
		Full-stack Developer



	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Participate to build and maintain product
		Building and managing the system's architecture on AWS
		Solve technical problems
		Research and suggest suitable technologies to apply in the project
		Review source code



	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		AWS (EC2, S3, SES, RDS)
		ReactJS, NestJS, Nginx, Docker, MongoDB
		Figma
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### HLPeace
*Oct 2022 - Jul 2024*
<columns>
	<column>
		**Description          **
	</column>
	<column>
		A platform allows users to do tasks and earn crypto as prize
		**Website**: [https://dao.hlpeace.jp/]({{https://dao.hlpeace.jp/}})
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		4 - 8
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Full-stack Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Participate to build and maintain product
		Building and managing the system's architecture on AWS
		Solve technical problems
		Research and suggest suitable technologies to apply in the project
		Review source code
	</column>
</columns>
<columns>
	<column>
		**Technologies used**



	</column>
	<column>
		AWS (EC2, S3, RDS)
		NextJS, NestJS, Docker, MongoDB
		Figma
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### Morpheus
*Mar 2024 - Sep 2024*
<columns>
	<column>
		**Description          **
	</column>
	<column>
		A low-code platform for building Dapp effectively
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		10
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Full-stack Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Participate to build and maintain product
		Solve technical problems
		Create demo project from the platform
	</column>
</columns>
<columns>
	<column>
		**Technologies used**



	</column>
	<column>
		VanillaJS, NodeJS, Docker, PostgresSQL, Sodility
		Figma
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### Furniture Maker
*Mar 2024 - Sep 2024*
<columns>
	<column>
		**Description          **



	</column>
	<column>
		An E-commerce web application for furniture sale
		**Website**: [furnituremaker.vn]({{https://furnituremaker.vn/}})
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		5
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Full-stack Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Participate to build and maintain product
		Solve technical problems
		Research and suggest suitable technologies to apply in the project
		Review source code
	</column>
</columns>
<columns>
	<column>
		**Technologies used**



	</column>
	<column>
		NextJS, NestJS, Docker, Supabase
		Vercel, Railway for deploying
		MedusaJS (E-commerce open source)
		Figma
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### Lensahub
*Oct 2024 - Dec 2024*
<columns>
	<column>
		**Description          **
	</column>
	<column>
		A severless CMS platform for Japanese enterprises to create their own website.
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		20
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Full-stack Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Participate to build and maintain product.
		Solve technical problems
		Review source code
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		ReactJS, NodeJS, Docker, MySQL
		AWS (Lambda, RDS, S3)
	</column>
</columns>
<columns>
	<column>
		---
	</column>
	<column>



	</column>
</columns>
### Cross-Chain Bridge Token
*Jan 2025 - Apr 2025*
<columns>
	<column>
		**Description          **
	</column>
	<column>
		Create a cross chain bridge token platform for my customer token
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		6
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Full-stack Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Participate to build and maintain product
		Handle event from blockchain
		React to smart contract to get information from blockchain
		Solve technical problems
		Review source code
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		ReactJS, NestJS, MongoDB, Sodility
		AWS, Gitlab, Docker
	</column>
</columns>
---
### Industrial Land Advisory
*Apr 2025 - Jul 2025*
<columns>
	<column>
		**Description          **
	</column>
	<column>
		An advisory platform that helps investors find, evaluate, and select industrial land for their business projects.
	</column>
</columns>
<columns>
	<column>
		**Team size**
	</column>
	<column>
		4
	</column>
</columns>
<columns>
	<column>
		**My position**
	</column>
	<column>
		Full-stack Developer
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Participate to design and build product.
		Build system documentation for applying AI to vibe coding.
		Solve technical problems.
		Review source code.
	</column>
</columns>
<columns>
	<column>
		**Technologies used**



	</column>
	<column>
		ReactJS, NestJS, PostgresSQL, LangChain, GenAI, RAG, OpenAI API
		AWS, Github, Docker, Supabase



	</column>
</columns>
</content>
</page>
`;

async function main(): Promise<void> {
  console.log('🚀 Starting CV migration...\n');

  try {
    // Parse author profile
    console.log('👤 Parsing author profile...');
    const authorData = parseNotionCvToAuthor(NOTION_CV_MD);

    // Upsert author by email
    const existingAuthor = await db
      .select()
      .from(authorProfiles)
      .where(eq(authorProfiles.email, authorData.email));

    let authorId: string;
    if (existingAuthor.length > 0) {
      console.log('   ✓ Author exists, updating...');
      await db
        .update(authorProfiles)
        .set(authorData)
        .where(eq(authorProfiles.email, authorData.email));
      authorId = existingAuthor[0].id;
    } else {
      console.log('   ✓ Creating new author...');
      const [newAuthor] = await db
        .insert(authorProfiles)
        .values(authorData)
        .returning();
      authorId = newAuthor.id;
    }
    console.log(`   ✓ Author ID: ${authorId}\n`);

    // Parse projects
    console.log('📦 Parsing projects...');
    const parsedProjects = parseNotionCvToProjects(NOTION_CV_MD);
    console.log(`   ✓ Found ${parsedProjects.length} projects\n`);

    // Collect all unique technologies
    console.log('🔧 Processing technologies...');
    const allTechNames = new Set<string>();
    for (const { technologyNames } of parsedProjects) {
      for (const name of technologyNames) {
        allTechNames.add(name);
      }
    }

    // Upsert technologies
    const techMap = new Map<string, string>(); // name -> id
    for (const name of allTechNames) {
      const slug = generateSlug(name);
      const existing = await db
        .select()
        .from(technologies)
        .where(eq(technologies.slug, slug));

      if (existing.length > 0) {
        techMap.set(name, existing[0].id);
      } else {
        const [newTech] = await db
          .insert(technologies)
          .values({ name, slug, description: null })
          .returning();
        techMap.set(name, newTech.id);
      }
    }
    console.log(`   ✓ Processed ${techMap.size} technologies\n`);

    // Upsert projects
    console.log('🚀 Upserting projects...');
    for (const { project, technologyNames } of parsedProjects) {
      const existing = await db
        .select()
        .from(projects)
        .where(eq(projects.slug, project.slug));

      let projectId: string;
      if (existing.length > 0) {
        // Update existing project
        await db
          .update(projects)
          .set(project)
          .where(eq(projects.slug, project.slug));
        projectId = existing[0].id;
        console.log(`   ✓ Updated: ${project.title}`);

        // Remove old technology associations
        await db
          .delete(projectTechnologies)
          .where(eq(projectTechnologies.projectId, projectId));
      } else {
        // Create new project
        const [newProject] = await db
          .insert(projects)
          .values(project)
          .returning();
        projectId = newProject.id;
        console.log(`   ✓ Created: ${project.title}`);
      }

      // Associate technologies
      if (technologyNames.length > 0) {
        const techIds = technologyNames
          .map((name) => techMap.get(name))
          .filter((id): id is string => id !== undefined);

        if (techIds.length > 0) {
          await db.insert(projectTechnologies).values(
            techIds.map((technologyId) => ({
              projectId,
              technologyId,
            }))
          );
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log(`   - Author: ${authorData.name}`);
    console.log(`   - Projects: ${parsedProjects.length}`);
    console.log(`   - Technologies: ${techMap.size}`);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
