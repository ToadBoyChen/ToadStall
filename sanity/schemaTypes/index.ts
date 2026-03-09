import { authorType } from './authorType'
import { blockContentType } from './blockContentType'
import { categoryType } from './categoryType'
import { communityType } from './communityType'
import { dataType } from './dataType'
import { toolType } from './toolType'
import { articleType } from './articleType'

export const schema = {
    types: [
      authorType,
      blockContentType,
      categoryType,
      articleType,
      communityType,
      dataType,
      toolType,
    ],
  }