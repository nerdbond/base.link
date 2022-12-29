import { MeshHint, code } from '~'
import type { MeshInputType } from '~'

export function process_codeCard_like(
  input: MeshInputType,
): void {
  code.assumeNest(input).nest.forEach((nest, index) => {
    process_codeCard_like_nestedChildren(
      code.extendWithNestScope(input, {
        index,
        nest,
      }),
    )
  })
}

export function process_codeCard_like_free(
  input: MeshInputType,
): void {}

export function process_codeCard_like_head(
  input: MeshInputType,
): void {}

export function process_codeCard_like_list(
  input: MeshInputType,
): void {}

export function process_codeCard_like_mesh(
  input: MeshInputType,
): void {}

export function process_codeCard_like_nestedChildren(
  input: MeshInputType,
): void {
  const type = code.determineNestType(input)
  switch (type) {
    case MeshHint.DynamicTerm:
      break
    case MeshHint.StaticTerm:
      const term = code.resolveStaticTermFromNest(input)
      switch (term) {
        case 'head':
          code.process_codeCard_like_head(input)
          break
        case 'like':
          code.process_codeCard_like(input)
          break
        case 'list':
          code.process_codeCard_like_list(input)
          break
        case 'mesh':
          code.process_codeCard_like_mesh(input)
          break
        case 'take':
          code.process_codeCard_like_take(input)
          break
        case 'free':
          code.process_codeCard_like_free(input)
          break
        case 'term':
          code.process_codeCard_like_term(input)
          break
      }
      break
    default:
      code.throwError(
        code.generateUnhandledNestCaseError(input, type),
      )
  }
}

export function process_codeCard_like_take(
  input: MeshInputType,
): void {}

export function process_codeCard_like_term(
  input: MeshInputType,
): void {}