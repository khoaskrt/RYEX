import { ROUTES } from '@/shared/config/routes';

export function goToDeposit(router) {
  router.push(ROUTES.deposit);
}

export function goToWithdraw(router) {
  router.push(ROUTES.withdraw);
}
