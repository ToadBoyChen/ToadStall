import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Workspace')
    .items([
      // Main Content
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content Types')
            .items([
              S.documentTypeListItem('article').title('Articles'),
              S.documentTypeListItem('discussion').title('Discussions'),
              S.documentTypeListItem('data').title('Data Hub'),
              S.documentTypeListItem('tool').title('Tools'),
            ])
        ),
      
      S.divider(),
      
      // Taxonomy & Metadata
      S.listItem()
        .title('Taxonomy')
        .child(
          S.list()
            .title('Taxonomy Types')
            .items([
              S.documentTypeListItem('category').title('Categories'),
              S.documentTypeListItem('author').title('Authors'),
            ])
        ),

      S.divider(),
      
      // Catch-all for other types
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['article', 'discussion', 'data', 'tool', 'category', 'author'].includes(item.getId()!),
      ),
    ])