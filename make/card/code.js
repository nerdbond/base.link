
const fs = require('fs')
const parse = require('../parse')
const shared = require('../shared')
const pathResolve = require('path')

module.exports = parseCodeCard

function parseCodeCard(link, text, linkTree, base) {
  const dir = pathResolve.dirname(link)
  const card = base.card(link)
  const seed = {
    text,
    link, // file path
    like: 'code-card',
    'load-list': [],
    base, // global environment, has `home` env vars.
    'text-tree': linkTree,
    'tree-mesh': {},
    'form-mesh': {},
    'suit-mesh': {},
    'task-mesh': {},
    'host-mesh': {},
    'face-mesh': {},
    'test-mesh': {},
    'bear-list': [],
    'show-tree-mesh': {},
    'show-form-mesh': {},
    'show-suit-mesh': {},
    'show-task-mesh': {},
    'show-host-mesh': {},
    'show-face-mesh': {},
    'show-test-mesh': {},
    'find-mesh': {},
    'hook-mesh': {},
    'task-text-mesh': {},
    'form-text-mesh': {},
  }
  // call it card.seed
  card.bind(seed)

  // console.log('CODE', link)

  linkTree.nest.forEach(nest => {
    if (shared.doesHaveFind(nest)) {
      throw new Error('Oops ' + link)
    } else if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'bear': {
          const bear = parseBear(nest, card, dir)
          seed['bear-list'].push(bear)
          break
        }
        case 'load': {
          const load = parseLoad(nest, card, dir)
          seed['load-list'].push(load)
          break
        }
        case 'fuse': {
          // const fuse = parseFuse(nest, card)
          // seed
          break
        }
        case 'tree': {
          const tree = parseTree(nest, card, dir)
          seed['tree-mesh'][tree.mesh.name] = tree
          seed['show-tree-mesh'][tree.mesh.name] = tree
          break
        }
        case 'face': {
          const face = parseFace(nest, card, dir)
          seed['face-mesh'][face.name] = face
          seed['show-face-mesh'][face.name] = face
          break
        }
        case 'host': {
          const host = parseHost(nest, card, dir)
          seed['host-mesh'][host.mesh.name] = host
          seed['show-host-mesh'][host.mesh.name] = host
          break
        }
        case 'form': {
          const form = parseForm(nest, card, dir)
          seed['form-mesh'][form.mesh.name] = form
          seed['show-form-mesh'][form.mesh.name] = form
          break
        }
        case 'suit': {
          const suit = parseSuit(nest, card, dir)
          seed['suit-mesh'][suit.name] = suit
          seed['show-suit-mesh'][suit.name] = suit
          break
        }
        case 'task': {
          const task = parseTask(nest, card, dir)
          seed['task-mesh'][task.name] = task
          seed['show-task-mesh'][task.name] = task
          break
        }
        case 'note': {
          break
        }
        default:
          throw new Error(`${term} ${link}`)
      }
    }
  })

  card.seed['load-list'].forEach(load => {
    if (!base.card_mesh.has(load.link)) {
      const loadText = fs.readFileSync(load.link, 'utf-8')
      // console.log('LOAD', load.link)
      const tree = parse(loadText)
      if (load.link.match(/deck\/\w+\.link\/base\.link/)) {
        base.system[load.link] = loadText
        parseCodeCard.parseDeckCard(load.link, tree, base)
      } else {
        parseCodeCard(load.link, loadText, tree, base)
      }
    }
  })

  card.seed['bear-list'].forEach(link => {
    if (!base.card_mesh.has(link)) {
      // console.log('LOAD BEAR', link)
      const loadText = fs.readFileSync(link, 'utf-8')
      const tree = parse(loadText)
      parseCodeCard(link, loadText, tree, base)
    }
  })
}

function parseBear(nest, card, dir) {
  const str = []
  nest.nest.forEach(nest => {
    if (shared.isText(nest)) {
      const text = shared.getText(nest, card)
      str.push(text)
    }
  })
  return shared.findPath(str.join(''), dir)
}

function parseHost(nest, card, dir) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const host = makeMeshLink({
    like: 'host',
    name,
    bond: undefined,
    like: undefined,
  })

  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'like':
          host.mesh.like = parseLike(nest)
          break
        case 'term':
          break
        case 'mark':
          const mark = parseMark(nest.nest[0])
          host.mesh.bond = mark
          break
        case 'note':
          break
        case 'host':
          host.mesh.bond ??= {}
          const host2 = parseHost(nest, card, dir)
          host.mesh.bond[host2.mesh.name] = host2
          break
        case 'name':
          break
        case 'fuse':
          break
        default:
          throw new Error(`${term} - ${card.seed.link}`)
      }
    } else if (shared.isText(nest)) {
      host.mesh.bond = shared.getText(nest)
    } else if (shared.isMark(nest)) {
      host.mesh.bond = shared.getMark(nest)
    } else {
      console.log(nest)
      throw new Error(`${card.seed.link}`)
    }
  })

  return host
}

function parseLike(nest) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const like = {
    like: 'like',
    name,
    bind: [],
  }

  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'like':
          like.bind.push(parseLike(nest))
          break
      }
    } else {
      console.log(nest)
      throw new Error
    }
  })

  return like
}

function parseMark(nest) {
  if (shared.isCode(nest)) {
    return shared.getCodeAsNumber(nest)
  } else {
    console.log(typeof nest, nest)
    throw new Error(JSON.stringify(nest))
  }
}

function parseForm(nest, card, dir) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const form = makeMeshLink({
    like: 'form',
    name,
    head: makeMeshLink({}),
    link: makeMeshLink({}),
    wear: makeMeshLink({}),
    task: makeMeshLink({})
  })

  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'link':
          const link = parseTake(nest, card, dir)
          setMeshLink(form.mesh.link, link.name, link)
          break
        case 'task':
          const task = parseTask(nest, card, dir)
          setMeshLink(form.mesh.task, task.name, task)
          break
        case 'head':
          const head = parseTake(nest, card, dir)
          setMeshLink(form.mesh.link, head.name, head)
          break
        case 'wear':

          break
        case 'base':

          break
        case 'case':

          break
        case 'fuse':

          break
        case 'hold':

          break
        case 'stem':

          break
        case 'note':

          break
        case 'like':

          break
        default:
          throw new Error(`${term} - ${card.seed.link}`)
      }
    } else {
      throw new Error(`${card.seed.link}`)
    }
  })

  return form
}

function parseSuit(nest, card, dir) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const suit = {
    like: 'suit',
    name,
    head: {},
    link: {},
    wear: {},
    task: {}
  }

  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'link':
          const link = parseTake(nest, card, dir)
          suit.link[link.name] = link
          break
        case 'task':
          const task = parseTask(nest, card, dir)
          suit.task[task.name] = task
          break
        case 'head':

          break
        case 'wear':

          break
        case 'base':

          break
        case 'slot':

          break
        case 'walk':

          break
        case 'case':

          break
        case 'fuse':

          break
        case 'hold':

          break
        case 'stem':

          break
        case 'note':

          break
        case 'like':

          break
        default:
          throw new Error(`${term} - ${card.seed.link}`)
      }
    } else {
      throw new Error(`${card.seed.link}`)
    }
  })

  return suit
}

function parseTask(nest, card, dir) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const task = makeMeshLink({
    like: 'task',
    name,
    head: makeMeshLink({}),
    take: makeMeshLink({}),
    free: makeMeshLink({}),
    task: makeMeshLink({}),
    call: [],
  })

  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'take':
          const take = parseTake(nest, card, dir)
          makeMeshLink(task.mesh.take, take.name, take)
          break
        case 'task':
          const task2 = parseTask(nest, card, dir)
          makeMeshLink(task.mesh.task, task2.mesh.name, task2)
          break
        case 'head':
          const head = parseTake(nest, card, dir)
          makeMeshLink(task.mesh.head, head.name, head)
          break
        case 'free':
          const free = parseTake(nest, card, dir)
          makeMeshLink(task.mesh.free, free.name, free)
          break
        case 'call':
          const call = parseCall(nest, card, dir)
          task.mesh.call.push(call)
          break
        case 'save':
          break
        case 'back':
          break
        case 'hide':
          break
        case 'wait':
          break
        case 'name':
          break
        case 'base':

          break
        case 'fuse':

          break
        case 'hold':

          break
        case 'stem':

          break
        case 'note':

          break
        default:
          throw new Error(`${term} - ${card.seed.link}`)
      }
    } else {
      throw new Error(`${card.seed.link}`)
    }
  })

  return task
}

function parseCall(nest, card, seed) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const call = {
    name,
    bind: [],
    hook: {}
  }

  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'hook':
          const hook = parseHook(nest, card, seed)
          call.hook[hook.name] = hook
          break
      }
    } else {
      throw new Error(`${card.seed.link}`)
    }
  })

  return call
}

function makeMeshLink(mesh) {
  return {
    like: 'mesh-link',
    mesh,
  }
}

function setMeshLink(meshLink, name, value) {
  meshLink.mesh[name] = value
}

function parseTree(nest, card, dir) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const tree = makeMeshLink({
    like: 'tree',
    name,
    take: makeMeshLink({}),
    hook: makeMeshLink({}),
    seed: makeMeshLink({
      like: 'seed',
      base: card.seed,
      site: makeMeshLink({}),
    })
  })
  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'take':
          const take = parseTake(nest, card, dir)
          setMeshLink(tree.mesh.take, take.name, take)
          setMeshLink(tree.mesh.seed.mesh.site, take.name, take)
          break
        case 'hook':
          const hook = parseTreeHook(nest, card, tree.seed)
          setMeshLink(tree.mesh.hook, hook.name, hook)
          break
        default:
          throw new Error(`${term} - ${card.seed.link}`)
      }
    } else {
      throw new Error(`${card.seed.link}`)
    }
  })
  return tree
}

function parseHook(nest, card, seed) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const hook = {
    name,
    take: {},
    call: [],
    seed: {
      base: seed,
      site: {},
    }
  }

  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'take':
          const take = parseTake(nest, card)
          hook.take[take.name] = take
          hook.seed.site[take.name] = take
          break
        case 'call':
          break
        default:
          throw new Error(`${term} - ${card.seed.link}`)
      }
    } else {
      throw new Error(`${card.seed.link}`)
    }
  })

  return hook
}

function parseTreeHook(nest, card, seed) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const hook = {
    name,
    link: nest.nest.slice(1),
  }

  return hook
}

function parseFace(nest, card, dir) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const face = {
    name,
    'dock-name': undefined,
    link: {},
    task: {}
  }

  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'name':
          face['dock-name'] = shared.getSimpleTerm(nest.nest[0])
          break
        case 'task':
          break
        case 'link':
          break
        case 'like':
          break
        case 'mesh':
          break
        case 'hook':
          break
        case 'head':
          break
        case 'base':
          break
        case 'intrinsic':
          break
        case 'text':
          break
        case 'mark':
          break
        case 'comb':
          break
        case 'code':
          break
        default:
          throw new Error(`${term} - ${card.seed.link}`)
      }
    } else {
      throw new Error(`${card.seed.link}`)
    }
  })

  return face
}

function parseLoad(nest, card, dir) {
  const load = {
    like: 'load',
    link: null,
    take: [],
    load: [],
  }
  // console.log(JSON.stringify(nest.nest[0], null, 2))
  // console.log(dir, shared.getText(nest.nest[0]))

  load.link = shared.findPath(shared.getText(nest.nest[0]), dir)

  nest.nest.slice(1).forEach(nest => {
    switch (nest.like) {
      case 'nest': {
        if (shared.isSimpleTerm(nest)) {
          const term = shared.getSimpleTerm(nest)
          switch (term) {
            case 'take':
              const take = parseLoadTake(nest)
              load.take.push(take)
              break
            case 'load':
              const childDir = pathResolve.dirname(load.link)
              // console.log('CHILD', childDir, nest)
              load.load.push(parseLoad(nest, card, childDir))
              break
            default:
              throw new Error(`${term} ${card.seed.link}`)
          }
        }
        break
      }
      default:
        throw new Error(`${nest.like} ${card.seed.link}`)
    }
  })

  return load
}

function parseTake(nest, card, dir) {
  const name = shared.getSimpleTerm(nest.nest[0])
  const take = {
    name,
    like: undefined,
    void: false,
  }
  nest.nest.slice(1).forEach(nest => {
    if (shared.isSimpleTerm(nest)) {
      const term = shared.getSimpleTerm(nest)
      switch (term) {
        case 'like':
          take.like = parseLike(nest)
          break
        case 'list':
          // TODO
          break
        case 'link':
          break
        case 'note':
          break
        case 'loan':
          break
        case 'flex':
          break
        case 'mesh':
          break
        case 'take':
          break
        case 'rest':
          break
        case 'base':
          break
        case 'void':
          // TODO
          const voidState = shared.getSimpleTerm(nest)
          take.void = voidState === 'true'
          break
        case 'hide':
          // TODO
          const hideState = shared.getSimpleTerm(nest)
          take.hide = hideState === 'true'
          break
        case 'wait':
          // TODO
          const waitState = shared.getSimpleTerm(nest)
          take.wait = waitState === 'true'
          break
        case 'risk':
          // TODO
          const riskState = shared.getSimpleTerm(nest)
          take.risk = riskState === 'true'
          break
        default:
          throw new Error(`${term} - ${card.seed.link}`)
      }
    } else {
      throw new Error(card.seed.link)
    }
  })
  console.log(take)
  return take
}

function parseLoadTake(nest) {
  const scope = nest.nest[0]
  const scopeTerm = shared.getSimpleTerm(scope)
  const name = scope.nest[0]
  const nameTerm = shared.getSimpleTerm(name)
  return {
    like: scopeTerm,
    name,
  }
}