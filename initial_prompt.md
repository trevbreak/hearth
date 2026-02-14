I want your help to make a self-hosted app for Product Managers that uses agentic concepts, but helps them with their core workflows of discover > design > delivery. 

*** Background on why I want to make this, and what it aims to solve ***
We have a lot of great tools emerging - where I personally use VSCode with all my Product documentation as markdown, a series of Product focused skills, and then use the claude code extension UI in that to automate - using an IDE like VScode is challenging for non-technical Product Managers who feel intimidated by it - with the layout lending itself to development over Product Management. While I feel really powerful by capturing all of my research/meeting minutes/initiatives/interviews all as markdown and using chained Claude skills to agentically process and handle those - this is beyond the realm of a number of PMs. For those PMs - they're still just using Claude/OpenAI projects (in their respective UI's), where they'll manually upload context into those - and then have to copy/share those out. Because their materials are in the UI of those paid LLM providers - they can't easily use things like MCP to connect and automate common workflows (eg. creating tickets in Jira/Linear, receiving transcripts of meetings from Zoom/Granola and processing them into minutes before pushing them out to others in Slack, or even rapidly prototyping tools/designs based on their project)

I want to solve this problem by creating a an application, aimed at Product Managers using Mac devices to help them to manage their projects, primarily as folders of files, editing documents (as markdown), and helping organise and automate behaviours on those files based on agentic Claude Code interactions, including MCP interactions.

Almost think of it as taking what an IDE like VSCode can do in terms of a left menu containing folders (projects + associating project information in those folders - much like Claude/OpenAI Project features), documents and files (mostly markdown with a simple WYSIWYG editor that feels as simple/easy as Confluence for a PM), and the agentic layer of Claude Code.

Some of the things it should do include:

- Allow PMs to create new projects (folders on the left menu)
- It will provision a project with a standard set of standard folders that it will organise content into (eg. /{project-name}/meetings, or /{project-name}/research)). The user can set settings of what is/isn't automatically created, and throughout we'll suggest additions (if needed)
- The core of each project is a PRD.md file, that shows the overall picture of the project
-  The folders are kept organised at all times. Any new content added is carefully organised into a standard location, with a standard name. The goal is that all information under a project is very easy to find and navigate.
- The Agent keeps reviewing/pruning information under the folders, allowing ideation and rapid creation of new materials to explore (divergence), but then consolidating those findings and reserach down into fewer documents that consolidate the findings (convergence)
- The whole structure will be managed by an orchestration agent that will constantly be looking at new materials created/added - analysing those to see both (a) where they should live within the structure to maintain the organisation, and (b) where that information aligns or conflicts with existing information. It's going will be to constantly looking for emerging themes or insights, suggest those to the user, and baed on that update the world view within or across a project. 
- At the top level (outside the /{project-name}) folders - data is kept that applies across the all projects. This includes data/research that are applicable broadly (eg. industry or company level research), and should contain context like the overall business and prodcut strategy - for which each {project-name} should be aligned.
- As part of system settings, you can configure information about your role and company - and it will use those as context throughout the whole project (much like a .claude.md file). This will contain things like your role, areas of responsibility, experience
Also at the system configuration level - it will maintain context about your company and it's brand, that it will use to inform strategy and brand/marketin activities. This will include things about your company like what it is, where you fit in, brand/logo/fonts/brand guidlines and tone of voice for your company. 
- At the top level you can also provide organisation context like maintaining a list of personas, that will be used throughout your projects.
- At the top level it will maintain a view of the roadmap, that will be a visual and pretty marketing style page (that can easily be converted and exported as a A4 PDF or a slide deck). You'll configure this view as a simple kanban of {project-name}'s which columns of 'discovery' > 'design' > 'delivery'. Later we'll create features to manage this easily.

Things PMs should be able to do with this application

- Quickly create a new opportunity/idea and form that into a project
- Do research/calls (via zoom/granola etc.) and have them automatically processed and synthesized into findings
- New findings create suggested changes to the PRD that can be accepted, or challenged and refined
- Automatically create/update Jira/Linear tickets based on the PRD
- Automatically create marketing materials, presentations, enablement guides, and help documents based on the PRD