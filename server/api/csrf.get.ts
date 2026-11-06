import {issueCsrf} from '../utils/csrf'
export default defineEventHandler(event=>issueCsrf(event))
