/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Hubot from 'hubot/es2015'
import fs from 'fs'
import path from 'path'
// import OptParse from 'optparse'

const pathResolve = path.resolve

// eslint-disable-next-line @typescript-eslint/no-var-requires
const OptParse = require('optparse')

// import dotenv from 'dotenv-defaults'
// eslint-disable-next-line @typescript-eslint/no-var-requires

// console.log(Hubot)
console.log(process.env)
console.log('The value of ROCKETCHAT_PASSWORD: is:', process.env.ROCKETCHAT_PASSWORD)

// require('hubot/bin/hubot')
// hubot.Adapter = new rocketchat.RocketchatAdapter()

// customize the following with your server and BOT account information
// const HOST = 'rocket.iaman.app'
// const USER = 'onebot'
// const PASS = 'onebot'
// const BOTNAME = 'onebot' // name  bot response to
// const SSL = true // server uses https ?
// const ROOMS = ['general']

// let myuserid: any
// this simple bot does not handle errors, different message types, server resets
// and other production situations

const switches = [
  ['-a', '--adapter ADAPTER', 'The Adapter to use'],
  ['-c', '--create PATH', 'Create a deployable hubot'],
  ['-d', '--disable-httpd', 'Disable the HTTP server'],
  ['-h', '--help', 'Display the help information'],
  ['-l', '--alias ALIAS', "Enable replacing the robot's name with alias"],
  ['-n', '--name NAME', 'The name of the robot in chat'],
  ['-r', '--require PATH', 'Alternative scripts path'],
  ['-t', '--config-check', "Test hubot's config to make sure it won't fail at startup"],
  ['-v', '--version', 'Displays the version of hubot installed'],
]

const options = {
  adapter: process.env.HUBOT_ADAPTER || 'shell',
  alias: process.env.HUBOT_ALIAS || false,
  create: process.env.HUBOT_CREATE || false,
  enableHttpd: process.env.HUBOT_HTTPD || true,
  scripts: process.env.HUBOT_SCRIPTS ? process.env.HUBOT_SCRIPTS.split(',') : [],
  name: process.env.HUBOT_NAME || 'Hubot',
  path: process.env.HUBOT_PATH || '.',
  configCheck: false,
  version: false,
}

const Parser = new OptParse.OptionParser(switches)
Parser.banner = 'Usage hubot [options]'

Parser.on('adapter', (opt: any, value: string) => {
  options.adapter = value
})

Parser.on('create', (opt: any, value: string) => {
  options.path = value
  options.create = true
})

Parser.on('disable-httpd', (opt: any) => {
  options.enableHttpd = false
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line no-unused-vars
Parser.on('help', (opt: any, value: any) => {
  console.log(Parser.toString())
  return process.exit(0)
})

Parser.on('alias', (opt: any, value: string | boolean) => {
  if (!value) {
    // eslint-disable-next-line no-param-reassign
    value = '/'
  }
  options.alias = value
})

Parser.on('name', (opt: any, value: string) => {
  options.name = value
})

Parser.on('require', (opt: any, value: string) => {
  options.scripts.push(value)
})

Parser.on('config-check', (opt: any) => {
  options.configCheck = true
})

Parser.on('version', (opt: any, value: any) => {
  options.version = true
})

Parser.on((opt: any, value: any) => {
  console.warn(`Unknown option: ${opt}`)
})

Parser.parse(process.argv)

if (process.platform !== 'win32') {
  process.on('SIGTERM', () => process.exit(0))
}

if (options.create) {
  console.error("'hubot --create' is deprecated. Use the yeoman generator instead:")
  console.error('    npm install -g yo generator-hubot')
  console.error(`    mkdir -p ${options.path}`)
  console.error(`    cd ${options.path}`)
  console.error('    yo hubot')
  console.error('See https://github.com/github/hubot/blob/master/docs/index.md for more details on getting started.')
  process.exit(1)
}

// eslint-disable-next-line max-len
const robot = Hubot.loadBot(undefined, options.adapter, options.enableHttpd, options.name, options.alias)

if (options.version) {
  console.log(robot.version)
  process.exit(0)
}
function loadHubotScripts() {
  const hubotScripts = pathResolve('.', 'hubot-scripts.json')
  let scripts
  let scriptsPath

  if (fs.existsSync(hubotScripts)) {
    let hubotScriptsWarning: string
    const data = fs.readFileSync(hubotScripts)

    if (data.length === 0) {
      return
    }

    try {
      scripts = JSON.parse(data.toString())
      scriptsPath = pathResolve('node_modules', 'hubot-scripts', 'src', 'scripts')
      robot.loadHubotScripts(scriptsPath, scripts)
    } catch (error) {
      const err = error
      robot.logger.error(`Error parsing JSON data from hubot-scripts.json: ${err}`)
      process.exit(1)
    }

    hubotScriptsWarning = 'Loading scripts from hubot-scripts.json is deprecated and ' + 'will be removed in 3.0 (https://github.com/github/hubot-scripts/issues/1113) ' + 'in favor of packages for each script.\n\n'

    if (scripts.length === 0) {
      hubotScriptsWarning += 'Your hubot-scripts.json is empty, so you just need to remove it.'
      return robot.logger.warning(hubotScriptsWarning)
    }

    const hubotScriptsReplacements = pathResolve('node_modules', 'hubot-scripts', 'replacements.json')
    const replacementsData = fs.readFileSync(hubotScriptsReplacements)
    const replacements = JSON.parse(replacementsData.toString())
    const scriptsWithoutReplacements: any[] = []

    if (!fs.existsSync(hubotScriptsReplacements)) {
      hubotScriptsWarning += 'To get a list of recommended replacements, update your hubot-scripts: npm install --save hubot-scripts@latest'
      return robot.logger.warning(hubotScriptsWarning)
    }

    hubotScriptsWarning += 'The following scripts have known replacements. Follow the link for installation instructions, then remove it from hubot-scripts.json:\n'

    scripts.forEach((script: string | number) => {
      const replacement = replacements[script]

      if (replacement) {
        hubotScriptsWarning += `* ${script}: ${replacement}\n`
      } else {
        scriptsWithoutReplacements.push(script)
      }
    })

    hubotScriptsWarning += '\n'

    if (scriptsWithoutReplacements.length > 0) {
      hubotScriptsWarning += 'The following scripts don’t have (known) replacements. You can try searching https://www.npmjs.com/ or http://github.com/search or your favorite search engine. You can copy the script into your local scripts directory, or consider creating a new package to maintain yourself. If you find a replacement or create a package yourself, please post on https://github.com/github/hubot-scripts/issues/1641:\n'
      hubotScriptsWarning += scriptsWithoutReplacements.map((script) => `* ${script}\n`).join('')
      hubotScriptsWarning += '\nYou an also try updating hubot-scripts to get the latest list of replacements: npm install --save hubot-scripts@latest'
    }

    robot.logger.warning(hubotScriptsWarning)
  }
}

function loadExternalScripts() {
  const externalScripts = pathResolve('.', 'external-scripts.json')

  if (!fs.existsSync(externalScripts)) {
    return
  }

  fs.readFile(externalScripts, (error, data) => {
    if (error) {
      throw error
    }

    try {
      robot.loadExternalScripts(JSON.parse(data))
    } catch (error) {
      console.error(`Error parsing JSON data from external-scripts.json: ${error}`)
      process.exit(1)
    }
  })
}
function loadScripts() {
  robot.load(pathResolve('.', 'scripts'))
  robot.load(pathResolve('.', 'src', 'scripts'))

  loadHubotScripts()
  loadExternalScripts()

  // eslint-disable-next-line consistent-return
  options.scripts.forEach((scriptPath: string) => {
    if (scriptPath[0] === '/') {
      return robot.load(scriptPath)
    }

    robot.load(pathResolve('.', scriptPath))
  })
}

if (options.configCheck) {
  loadScripts()
  console.log('OK')
  process.exit(0)
}

robot.adapter.once('connected', loadScripts)

robot.run()
