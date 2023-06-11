import card from '~/make/card.js'
import tool from '~/make/tool.js'
import { MeshLoad } from '~/make/form.js'

export function load_codeCard_head(load: MeshLoad): void {
  const red = card.pushRed(
    load,
    card.createRedGather(load, 'typeInputs'),
  )
  const blue = card.pushBlue(load, 'typeInputs', {
    type: Mesh.ClassInput,
  })

  const colorInput = card.withColors(load, { blue, red })

  card.assumeNest(colorInput).forEach((nest, index) => {
    card.addTask(load.base, () => {
      card.load_codeCard_head_nestedChildren(
        card.withLink(load, nest, index),
      )
    })
  })
}

export function load_codeCard_head_nestedChildren(
  load: MeshLoad,
): void {
  const type = card.getLinkHint(load)
  switch (type) {
    case LinkHint.StaticTerm:
      const term = card.assumeTermString(load)
      const index = card.loadLinkIndex(load)
      if (index === 0) {
        card.attachStaticTerm(load, 'name', term)
        return
      }

      switch (term) {
        case 'like':
          card.load_codeCard_like(load)
          break
        case 'base':
          card.load_codeCard_like(load)
          break
        default:
          card.throwError(card.generateUnhandledTermCaseError(load))
      }
      break
    default:
      card.throwError(card.generateUnhandledNestCaseError(load, type))
  }
}