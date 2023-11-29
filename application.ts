/**
 * This is the frontend application entrypoint.
 *
 * It is built via an esbuild command in the Dockerfile.
 *
 * While the react app has a root that will pull in all of its dependencies, the angular app
 * is distributed across many files that aren't directly referenced. Any new angular files must be
 * imported here by hand.
 */
import './modules/client/core/app/config'
import './modules/client/core/app/react-global-state'
import './modules/client/core/app/reactapp'
import './modules/client/core/core.client.module.ts'
import './modules/client/core/services/socket.io.client.service.ts'
import './modules/client/game/game.client.module.ts'
import './modules/client/lobby/lobby.client.module.ts'
import './modules/client/rules/rules.client.module.ts'
import './modules/client/topics/topics.client.module.ts'
import './modules/client/users/config/users.client.config.ts'