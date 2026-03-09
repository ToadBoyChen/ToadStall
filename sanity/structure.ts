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
              S.documentTypeListItem('community').title('Communities'),
              S.documentTypeListItem('data').title('Data Hub'),
              S.documentTypeListItem('tools-technical').title('Tools & Technical'),
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
        (item) => item.getId() && !['article', 'community', 'data', 'tools-technical', 'category', 'author'].includes(item.getId()!),
      ),
    ])