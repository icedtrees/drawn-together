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
import './modules/client/core/config/core-admin.client.routes.ts'
import './modules/client/core/config/core.client.routes.ts'
import './modules/client/core/core.client.module.ts'
import './modules/client/core/directives/show-errors.client.directives.ts'
import './modules/client/core/services/interceptors/auth.interceptor.client.service.ts'
import './modules/client/core/services/socket.io.client.service.ts'
import './modules/client/game/config/game.client.config.ts'
import './modules/client/game/config/game.client.routes.ts'
import './modules/client/game/game.client.module.ts'
import './modules/client/lobby/config/lobby.client.config.ts'
import './modules/client/lobby/config/lobby.client.routes.ts'
import './modules/client/lobby/lobby.client.module.ts'
import './modules/client/lobby/lobby.tsx'
import './modules/client/rules/config/rules.client.config.ts'
import './modules/client/rules/config/rules.client.routes.ts'
import './modules/client/rules/controllers/rules.client.controller.ts'
import './modules/client/rules/rules.client.module.ts'
import './modules/client/topics/config/topics.client.config.ts'
import './modules/client/topics/config/topics.client.routes.ts'
import './modules/client/topics/topics.client.module.ts'
import './modules/client/users/config/users-admin.client.menus.ts'
import './modules/client/users/config/users-admin.client.routes.ts'
import './modules/client/users/config/users.client.config.ts'
import './modules/client/users/config/users.client.routes.ts'
import './modules/client/users/controllers/admin/list-users.client.controller.ts'
import './modules/client/users/controllers/admin/user.client.controller.ts'
import './modules/client/users/controllers/password.client.controller.ts'
import './modules/client/users/controllers/settings/change-password.client.controller.ts'
import './modules/client/users/controllers/settings/change-profile-picture.client.controller.ts'
import './modules/client/users/controllers/settings/edit-profile.client.controller.ts'
import './modules/client/users/controllers/settings/settings.client.controller.ts'
import './modules/client/users/directives/password-verify.client.directive.ts'
import './modules/client/users/directives/users.client.directive.ts'
import './modules/client/users/services/users.client.service.ts'