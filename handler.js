const { Log } = require('./utils');

module.exports.index = async (event, context) => {
  const {environment, auth_key, domain, couch_url, commit} = event;

  if(!environment) { Log.error('environment', 'Not set', `Environment has not been set.\r\nevent: ${event}`); return; }
  if(!auth_key) { Log.error(environment, 'Not set', 'auth_key has not been set.'); return; }
  if(!domain) { Log.error(environment, 'Not set', 'Domain has not been set.'); return; }
  if(!couch_url) { Log.error(environment, 'Not set', 'Couch_url has not been set.'); return; }
  if(!process.env.ACTIVE_ENV.split('|').includes(environment)) { Log.console(environment, 'Not set', `Invalid environment (${environment}) for current stage (${process.env.STAGE})`); return; }

  // cloudrecruit|flatfeerecruiting
  const indexer = require('./lib/indexer')(event);

  Cloudant = require('@cloudant/cloudant');
  cloudant = new Cloudant({
    url: couch_url,
    maxAttempt: 5,
    plugins: {
      retry: {
        retryErrors: false,
        retryStatusCodes: [429]
      }
    }
  });

  const db = cloudant.db.use('ft');
  let { rows: orgs } = await db.view('ft', 'orgsForGoogle', {});

  // orgs = [
  //   // { id: 'acmecorp', key: 'acmecorp', value: 'acmecorp' },
  //   // { id: 'monsterinc', key: 'monsterinc', value: 'monsterinc' }
  //   // { id: 'acmecorp', key: 'acmecorp', value: 'acmecorp' }
  // ];

  if(event.orgs) {
    orgs = event.orgs;
  }

  let groups = [];
  while(orgs.length > 0) { groups.push(orgs.splice(0,1)); }

  let res = [];
  for(let i = 0; i < groups.length; i++)
    res.push(await Promise.all(groups[i].map(async (o) => { return await indexer.index(o.id); })));
  return res;
};
