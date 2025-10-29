import { describe, it, expect } from 'vitest';
import {
  parseNotionCvToAuthor,
  parseNotionCvToProjects,
} from '../../src/services/migration/notion-cv-mapper';

const SAMPLE_NOTION_CV = `
<page url="{{https://www.notion.so/test}}">
<content>
<columns>
	<column>
		<image source="{{https://example.com/avatar.jpg}}"></image>
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
## About me
---
- 6+ years of hands-on experience efficiently coding websites and applications.
- 3+ years working with NestJS, building codebases.
- Good self-study ability, problem solving, teamwork.
## Projects
---
### Cabineat
*Jun 2021 - Dec 2021*
<columns>
	<column>
		**Description**
	</column>
	<column>
		This is a platform that allows business owners to manage all their shops conveniently and simply
		**Website**: [https://my.cabineat.vn]({{https://my.cabineat.vn/sign-in}})
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Contribute to building system
		Build and maintain Front-end site
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		NextJS, React Native, NestJS, PostgreSQL, Firebase
		Figma
	</column>
</columns>
### Ongoing Project
*Jan 2023 - now*
<columns>
	<column>
		**Description**
	</column>
	<column>
		A project currently in development
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		ReactJS, NodeJS
	</column>
</columns>
</content>
</page>
`;

describe('notion-cv-mapper', () => {
  describe('parseNotionCvToAuthor', () => {
    it('should extract author profile with all fields', () => {
      const author = parseNotionCvToAuthor(SAMPLE_NOTION_CV);

      expect(author.name).toBe('KIEN HA MINH');
      expect(author.email).toBe('minhkien2208@gmail.com');
      expect(author.avatar).toBe('https://example.com/avatar.jpg');
      expect(author.bio).toContain('6+ years of hands-on experience');
      expect(author.bio).toContain('3+ years working with NestJS');
      expect(author.socialLinks).toMatchObject({
        address: 'K12/08 Hoang Van Thai Street, Danang',
        mobile: '0776978875',
        facebook: 'https://www.facebook.com/haminh.kien',
        linkedin: 'http://linkedin.com/in/haminhkien',
        github: 'https://github.com/kienhaminh',
      });
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalCv = `
        <page>
        <content>
        ### Full Stack Developer
        **Email**: test@example.com
        ## About me
        ---
        - Test bio
        ## Projects
        ---
        </content>
        </page>
      `;

      const author = parseNotionCvToAuthor(minimalCv);

      expect(author.name).toBe('KIEN HA MINH');
      expect(author.email).toBe('test@example.com');
      expect(author.avatar).toBeNull();
    });
  });

  describe('parseNotionCvToProjects', () => {
    it('should extract projects with all fields', () => {
      const projects = parseNotionCvToProjects(SAMPLE_NOTION_CV);

      expect(projects).toHaveLength(2);

      const cabineat = projects[0];
      expect(cabineat.project.title).toBe('Cabineat');
      expect(cabineat.project.slug).toBe('cabineat');
      expect(cabineat.project.description).toContain(
        'platform that allows business owners'
      );
      expect(cabineat.project.liveUrl).toBe('https://my.cabineat.vn/sign-in');
      expect(cabineat.project.status).toBe('PUBLISHED');
      expect(cabineat.project.isOngoing).toBe(false);
      expect(cabineat.project.startDate).toBeInstanceOf(Date);
      expect(cabineat.project.endDate).toBeInstanceOf(Date);

      if (cabineat.project.startDate) {
        expect(cabineat.project.startDate.getFullYear()).toBe(2021);
        expect(cabineat.project.startDate.getMonth()).toBe(5); // June (0-indexed)
      }

      if (cabineat.project.endDate) {
        expect(cabineat.project.endDate.getFullYear()).toBe(2021);
        expect(cabineat.project.endDate.getMonth()).toBe(11); // December
      }
    });

    it('should extract technology names correctly', () => {
      const projects = parseNotionCvToProjects(SAMPLE_NOTION_CV);
      const cabineat = projects[0];

      expect(cabineat.technologyNames).toContain('NextJS');
      expect(cabineat.technologyNames).toContain('React Native');
      expect(cabineat.technologyNames).toContain('NestJS');
      expect(cabineat.technologyNames).toContain('PostgreSQL');
      expect(cabineat.technologyNames).toContain('Firebase');
      expect(cabineat.technologyNames).toContain('Figma');
    });

    it('should handle ongoing projects correctly', () => {
      const projects = parseNotionCvToProjects(SAMPLE_NOTION_CV);
      const ongoingProject = projects[1];

      expect(ongoingProject.project.title).toBe('Ongoing Project');
      expect(ongoingProject.project.isOngoing).toBe(true);
      expect(ongoingProject.project.endDate).toBeNull();
      expect(ongoingProject.project.startDate).toBeInstanceOf(Date);

      if (ongoingProject.project.startDate) {
        expect(ongoingProject.project.startDate.getFullYear()).toBe(2023);
        expect(ongoingProject.project.startDate.getMonth()).toBe(0); // January
      }
    });

    it('should generate valid slugs for project titles', () => {
      const projects = parseNotionCvToProjects(SAMPLE_NOTION_CV);

      for (const { project } of projects) {
        expect(project.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(project.slug.length).toBeGreaterThan(0);
      }
    });

    it('should deduplicate technologies within a project', () => {
      const cvWithDuplicates = `
        ## Projects
        ---
        ### Test Project
        *Jan 2021 - Feb 2021*
        <columns>
          <column>
            **Description**
          </column>
          <column>
            Test description
          </column>
        </columns>
        <columns>
          <column>
            **Technologies used**
          </column>
          <column>
            ReactJS, NodeJS, ReactJS, MongoDB, NodeJS
          </column>
        </columns>
      `;

      const projects = parseNotionCvToProjects(cvWithDuplicates);
      const techNames = projects[0].technologyNames;

      expect(techNames).toContain('ReactJS');
      expect(techNames).toContain('NodeJS');
      expect(techNames).toContain('MongoDB');
      expect(techNames.filter((t) => t === 'ReactJS')).toHaveLength(1);
      expect(techNames.filter((t) => t === 'NodeJS')).toHaveLength(1);
    });

    it('should handle projects without website URLs', () => {
      const cvWithoutUrl = `
        ## Projects
        ---
        ### Test Project
        *Jan 2021 - Feb 2021*
        <columns>
          <column>**Description**</column>
          <column>A project without a URL</column>
        </columns>
        <columns>
          <column>**Technologies used**</column>
          <column>ReactJS</column>
        </columns>
      `;

      const projects = parseNotionCvToProjects(cvWithoutUrl);
      expect(projects[0].project.liveUrl).toBeNull();
    });

    it('should return empty array when no projects section exists', () => {
      const cvWithoutProjects = `
        <page>
        <content>
        ## About me
        ---
        - Test bio
        </content>
        </page>
      `;

      const projects = parseNotionCvToProjects(cvWithoutProjects);
      expect(projects).toEqual([]);
    });
  });

  describe('date parsing edge cases', () => {
    it('should handle various date formats', () => {
      const cvWithDates = `
        ## Projects
        ---
        ### Project A
        *Sep 2019 - Feb 2020*
        <columns><column>**Description**</column><column>Test</column></columns>
        <columns><column>**Technologies used**</column><column>React</column></columns>
        ### Project B
        *Jan 2021 - Mar 2021*
        <columns><column>**Description**</column><column>Test</column></columns>
        <columns><column>**Technologies used**</column><column>Vue</column></columns>
      `;

      const projects = parseNotionCvToProjects(cvWithDates);

      expect(projects).toHaveLength(2);
      expect(projects[0].project.startDate).toBeInstanceOf(Date);
      expect(projects[1].project.startDate).toBeInstanceOf(Date);
    });

    it('should handle invalid date ranges gracefully', () => {
      const cvWithInvalidDates = `
        ## Projects
        ---
        ### Invalid Project
        *Invalid Date Format*
        <columns><column>**Description**</column><column>Test</column></columns>
        <columns><column>**Technologies used**</column><column>React</column></columns>
      `;

      const projects = parseNotionCvToProjects(cvWithInvalidDates);

      expect(projects).toHaveLength(1);
      expect(projects[0].project.startDate).toBeNull();
      expect(projects[0].project.endDate).toBeNull();
      expect(projects[0].project.isOngoing).toBe(false);
    });
  });
});
