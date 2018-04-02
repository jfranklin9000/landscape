import { api } from './urbit-api';
import { uuid } from './util';

export let Reports = {
  'circle.gram': {}, // messages
  'circle.nes': {}, // messages
  'circle.pes.loc': {},
  'circle.pes.rem': {},
  'circle.cos.loc': {}, // configs
  'circle.cos.rem': {}, // configs
  'circle.config.dif.full': {
    execute: function () {
      if (this.pending) {
        this.pending.forEach((item) => {
          switch(item.type) {
            case "transition":
              window.router.transitionTo(item.data.target)
              break;
            case "invites":
              let inv = item.data;

              api.hall({
                permit: {
                  nom: inv.nom,
                  sis: inv.aud,
                  inv: true
                }
              });

              let audInboxes = inv.aud.map((aud) => `~${aud}/inbox`);
              // console.log('inboxes = ', audInboxes);

              let message = {
                uid: uuid(),
                aud: audInboxes,
                aut: api.authTokens.ship,
                wen: Date.now(),
                sep: {
                  inv: {
                    inv: true,
                    cir: `~${api.authTokens.ship}/${inv.nom}`
                  }
                }
              };

              api.hall({
                convey: [message]
              });
          }
        })
      }

      this.pending = [];
    }
  },
  'circle.config.dif.source': {},
  'circle.config.dif.permit': {
    include: "circle.config"
  },
  'circles': {
    execute: function () {
      if (this.pending) {
        this.pending.forEach((item) => {
          switch(item.type) {
            case "subscribe-inbox":
              api.hall({
                source: {
                  nom: `inbox`,
                  sub: true,
                  srs: [item.data.cir]
                }
              });
              break;
          }
        })

        this.pending = [];
      }
    }
  }


}
