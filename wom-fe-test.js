import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 100 },    // Ramp-up to 100 users
    { duration: '1m', target: 1000 },    // Spike to 1000
    { duration: '2m', target: 10000 },   // Simulate 10K concurrent users
    { duration: '30s', target: 0 },      // Ramp down
  ],
};

export default function () {
  const res = http.get('https://wom-fe-cruellacodes-projects.vercel.app');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
