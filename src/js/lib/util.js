import _ from 'lodash';
import urbitOb from 'urbit-ob';
import classnames from 'classnames';
import { PAGE_STATUS_READY, PAGE_STATUS_PROCESSING, PAGE_STATUS_TRANSITIONING, PAGE_STATUS_DISCONNECTED, PAGE_STATUS_RECONNECTING, AGGREGATOR_NAMES } from '/lib/constants';

export function capitalize(str) {
  return `${str[0].toUpperCase()}${str.substr(1)}`;
}

export function getQueryParams() {
  if (window.location.search !== "") {
    return JSON.parse('{"' + decodeURI(window.location.search.substr(1).replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
  } else {
    return {};
  }
}

export function isAggregator(station) {
  let cir = station.split("/")[1]
  return AGGREGATOR_NAMES.includes(cir);
}

// export function isCollection(station) {
//   let circle = station.split("/")[1];
//   let collParts = circle.split("-");
//   if (circle.includes("c-"))
// }


export function getLoadingClass(storeTransition) {
  return classnames({
    'hide': storeTransition === PAGE_STATUS_READY,
    'page-status': storeTransition !== PAGE_STATUS_READY,
    'page-status-primary': storeTransition === PAGE_STATUS_TRANSITIONING,
    'page-status-secondary': storeTransition === PAGE_STATUS_PROCESSING,
    'page-status-tertiary': storeTransition === PAGE_STATUS_DISCONNECTED,
    'page-status-quaternary': storeTransition === PAGE_STATUS_RECONNECTING,
  })
}

/*
  Goes from:
    1531943107869               // "javascript unix time"
  To:
    "48711y 2w 5d 11m 9s"       // "stringified time increments"
*/

export function secToString(secs) {
  if (secs <= 0) {
    return 'Completed';
  }
  secs = Math.floor(secs)
  var min = 60;
  var hour = 60 * min;
  var day = 24 * hour;
  var week = 7 * day;
  var year = 52 * week;
  var fy = function(s) {
    if (s < year) {
      return ['', s];
    } else {
      return [Math.floor(s / year) + 'y', s % year];
    }
  }
  var fw = function(tup) {
    var str = tup[0];
    var sec = tup[1];
    if (sec < week) {
      return [str, sec];
    } else {
      return [str + ' ' + Math.floor(sec / week) + 'w', sec % week];
    }
  }
  var fd = function(tup) {
    var str = tup[0];
    var sec = tup[1];
    if (sec < day) {
      return [str, sec];
    } else {
      return [str + ' ' + Math.floor(sec / day) + 'd', sec % day];
    }
  }
  var fh = function(tup) {
    var str = tup[0];
    var sec = tup[1];
    if (sec < hour) {
      return [str, sec];
    } else {
      return [str + ' ' + Math.floor(sec / hour) + 'h', sec % hour];
    }
  }
  var fm = function(tup) {
    var str = tup[0];
    var sec = tup[1];
    if (sec < min) {
      return [str, sec];
    } else {
      return [str + ' ' + Math.floor(sec / min) + 'm', sec % min];
    }
  }
  var fs = function(tup) {
    var str = tup[0];
    var sec = tup[1];
    return str + ' ' + sec + 's';
  }
  return fs(fm(fh(fd(fw(fy(secs)))))).trim();
}

export function collectionAuthorization(stationDetails, usership) {
  if (stationDetails.host === usership) {
    return "write";
  } else if (_.has(stationDetails, "config.con.sec")) {
    let sec = _.get(stationDetails, "config.con.sec", null);
    if (sec === "journal") {
      return "write";
    }
  }

  return "read";
}

export function uuid() {
  let str = "0v"
  str += Math.ceil(Math.random()*8)+"."
  for (var i = 0; i < 5; i++) {
    let _str = Math.ceil(Math.random()*10000000).toString(32);
    _str = ("00000"+_str).substr(-5,5);
    str += _str+".";
  }

  return str.slice(0,-1);
}

// export function parseCollCircle(station) {
//   let collTa = station.split('/')[1].split('-')[1];
//   let collPath = ['web', 'collections'].concat(pax).join()
//
//   let sp = st.split('/');
//   let pax = sp[1].split('-');
//   pax.shift();
//   pax = ['web', 'collections'].concat(pax);
//
//   let  r = {
//       ship: sp[0],
//       path: pax,
//       name: pax[pax.length-1]
//   }
//   return r;
// }

export function isPatTa(str) {
  const r = /^[a-z,0-9,\-,\.,_,~]+$/.exec(str)
  return !!r;
}

export function isValidStation(st) {
  let tokens = st.split("/")

  if (tokens.length !== 2) return false;

  return urbitOb.isShip(tokens[0]) && isPatTa(tokens[1]);
}


/*
  Goes from:
    ~2018.7.17..23.15.09..5be5    // urbit @da
  To:
    (javascript Date object)
*/
export function daToDate(st) {
  var dub = function(n) {
    return parseInt(n) < 10 ? "0" + parseInt(n) : n.toString();
  };
  var da = st.split('..');
  var bigEnd = da[0].split('.');
  var lilEnd = da[1].split('.');
  var ds = `${bigEnd[0].slice(1)}-${dub(bigEnd[1])}-${dub(bigEnd[2])}T${dub(lilEnd[0])}:${dub(lilEnd[1])}:${dub(lilEnd[2])}Z`;
  return new Date(ds);
}

/*
  Goes from:
    (javascript Date object)
  To:
    ~2018.7.17..23.15.09..5be5    // urbit @da
*/

export function dateToDa(d, mil) {
  var fil = function(n) {
    return n >= 10 ? n : "0" + n;
  };
  return (
    `~${d.getUTCFullYear()}.` +
    `${(d.getUTCMonth() + 1)}.` +
    `${fil(d.getUTCDate())}..` +
    `${fil(d.getUTCHours())}.` +
    `${fil(d.getUTCMinutes())}.` +
    `${fil(d.getUTCSeconds())}` +
    `${mil ? "..0000" : ""}`
  );
}

  // ascending for clarity
// export function sortSrc(circleArray, topic=false){
//   let sc = circleArray.map((c) => util.parseCollCircle(c)).filter((pc) => typeof pc != 'undefined' && typeof pc.top == 'undefined');
//   return sc.map((src) => src.coll).sort((a, b) => util.daToDate(a) - util.daToDate(b));
// }

export function arrayEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function deSig(ship) {
  return ship.replace('~', '');
}

// use urbit.org proxy if it's not on our ship
export function foreignUrl(shipName, own, urlFrag) {
  if (deSig(shipName) != deSig(own)) {
    return `http://${deSig(shipName)}.urbit.org${urlFrag}`
  } else {
    return urlFrag
  }
}

// shorten comet names
export function prettyShip(ship) {
  const sp = ship.split('-');
  return [sp.length == 9 ? `${sp[0]}_${sp[8]}`: ship, ship[0] === '~' ? `/~~/${ship}/==/web/landscape/profile` : `/~~/~${ship}/==/web/landscape/profile`];
}

export function profileUrl(ship) {
  return `/~~/~${ship}/==/web/landscape/profile`;
}

export function isDMStation(station) {
  let host = station.split('/')[0].substr(1);
  let circle = station.split('/')[1];

  return (
    station.indexOf('.') !== -1 &&
    circle.indexOf(host) !== -1
  );
}

export function calculateStations(configs) {
  let numSubs = Object.keys(configs).filter((sta) => !isDMStation(sta) && !sta.includes("inbox")).length;
  let numDMs = Object.keys(configs).filter((sta) => isDMStation(sta)).length;

  let numString = [];
  if (numSubs) numString.push(`${numSubs} subscriptions`);
  if (numDMs) numString.push(`${numDMs} DMs`);

  numString = numString.join(", ");

  return numString;
}

export function isRootCollection(station) {
  return station.split("/")[1] === "c";
}

export function getMessageContent(msg) {
  let ret;

  const MESSAGE_TYPES = {
    'sep.app.sep.fat.sep.lin.msg': 'app',
    'sep.app.sep.lin.msg': 'app',
    'sep.fat': (msg) => {

      let type =  msg.sep.fat.tac.text;
      let station = msg.aud[0];
      let stationDetails = getStationDetails(station);
      let jason = JSON.parse(msg.sep.fat.sep.lin.msg);
      let content = (type.includes('collection')) ? null : jason.content;

      let par = jason.path.slice(0, -1);

      return {
        type: msg.sep.fat.tac.text,
        contentType: jason.type,
        content: content,
        owner: jason.owner,
        date: jason.date,
        path: jason.path,
        postTitle: jason.name,
        postUrl: `/~~/${jason.owner}/==/${jason.path.join('/')}`,
        parentTitle: jason.path.slice(-2, -1),
        parentUrl: `/~~/${jason.owner}/==/${jason.path.slice(0, -1).join('/')}`,
      }
    },
    'sep.inv.cir': 'inv',
    'sep.lin.msg': 'lin',
    'sep.url': 'url',
    'sep.exp': (msg) => {
      return {
        type: "exp",
        content: msg.sep.exp.exp,
        res: msg.sep.exp.res.join('\n')
      }
    },
  }

  Object.arrayify(MESSAGE_TYPES).some(({key, value}) => {
    if (_.has(msg, key)) {
      if (typeof value === "string") {
        ret = {
          type: value,
          content: _.get(msg, key)
        }
      } else if (typeof value === "function") {
        ret = value(msg);
      }
      return true;
    }
  });

  if (typeof ret === "undefined") {
    ret = {type: "unknown"};
    console.log("ASSERT: unknown message type on ", msg)
  }

  return ret;
}

export function getStationDetails(station) {
  let host = station.split("/")[0].substr(1);
  let config = warehoues.store.configs[station];

  let ret = {
    type: "none",
    station: station,
    host: host,
    cir: station.split("/")[1],
    hostProfileUrl: profileUrl(host)
  };

  let circleParts = ret.cir.split("-");

  if (station.includes("inbox")){
    ret.type = "inbox";
  } else if (isDMStation(station)) {
    ret.type = "dm";
  } else if (ret.cir.includes("c-") && circleParts.length > 2) {
    ret.type = "collection-post";
  } else if (ret.cir.includes("c-")) {
    ret.type = "collection-index";
  } else {
    ret.type = "chat";
  }

  switch (ret.type) {
    case "inbox":
      ret.stationUrl = "/~~/landscape";
      ret.stationTitle = ret.cir;
      break;
    case "chat":
      ret.stationUrl = `/~~/landscape/stream?station=${station}`;
      ret.stationDetailsUrl = `/~~/landscape/stream/details?station=${station}`;
      ret.stationTitle = ret.cir;
      break;
    case "dm":
      if (config.con) {
        ret.stationTitle = ret.cir
          .split(".")
          .filter((mem) => mem !== api.authTokens.ship)
          .map((mem) => `~${mem}`)
          .join(", ");;
      } else {
        ret.stationTitle = "unknown";
      }

      ret.stationUrl = `/~~/landscape/stream?station=${station}`;
      break;
    case "collection-index":
      ret.collId = circleParts[1];

      ret.stationUrl = `/~~/~${ret.host}/==/web/collections/${ret.collId}`;
      ret.stationTitle = "TBD";
      break;
    case "collection-post":
      ret.collId = circleParts[1];
      ret.postId = circleParts[2];

      ret.stationUrl = `/~~/~${ret.host}/==/web/collections/${ret.collId}/${ret.postId}`;
      ret.stationTitle = "TBD";
      break;
  }

  return ret;
}

export function getSubscribedStations(ship, storeConfigs) {
  let inbox = storeConfigs[`~${ship}/inbox`];
  if (!inbox) return null;

  let stationDetailList = inbox.src
    .map((station) => {
      if (!storeConfigs[station]) return null;
      return getStationDetails(station, storeConfigs[station], ship)
    })
    .filter((station) => station !== null);

  let ret = {
    chatStations: stationDetailList.filter((d) => d.type === "chat"),
    collStations: stationDetailList.filter((d) => d.type === "collection"),
    dmStations: stationDetailList.filter((d) => d.type === "dm"),
  };

  let numSubs = ret.chatStations.length + ret.collStations.length;
  let numDMs = ret.dmStations.length;

  let numString = [];
  if (numSubs > 0) numString.push(`${numSubs} subscriptions`);
  if (numDMs > 0) numString.push(`${numDMs} DMs`);

  ret.numString = numString.join(", ");

  return ret;
}

// maybe do fancier stuff later
export function isUrl(string) {
  const r = /^http|^www|\.com$/.exec(string)
  if (r) {
    return true
  }
  else {
    return false
  }
}
