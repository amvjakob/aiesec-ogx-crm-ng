// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  meEndpoint: 'https://ogx-crm.ch/api/me.php',
  lcsEndpoint: 'https://ogx-crm.ch/api/lcs.php',
  apiEndpoint: 'https://ogx-crm.ch/api/api.php',
  authEndpoint: 'https://ogx-crm.ch/api/login.php',
  pushEndpoint: 'https://ogx-crm.ch/api/push_manual.php',
  statsEndpoint: 'https://ogx-crm.ch/api/trello_stats.php',
  host: 'http://localhost:4200',
  mcID: 2331
}; 

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
