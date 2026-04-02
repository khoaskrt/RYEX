import { ROUTES } from '@/shared/config/routes';

export function goToDeposit(router) {
  router.push(ROUTES.deposit);
}

export function goToWithdraw(router) {
  router.push(ROUTES.withdraw);
}

export function goToFunding(router) {
  router.push(ROUTES.funding);
}

export function goToTradingAccount(router) {
  router.push(ROUTES.tradingAccount);
}
