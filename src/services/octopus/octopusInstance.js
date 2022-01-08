import { Octopus } from './index';

const octopusInstance = new Octopus({
  host:
    process.env.NODE_ENV === 'development'
    ? 'localhost:8585'
    : window.location.host,
  path: '/ws/v1/feeds',
  loginId: sessionStorage.getItem('login_id'),
  token: sessionStorage.getItem('auth_token')
});

export default octopusInstance;
