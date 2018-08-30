import React, { Component } from 'react';
import { IconBlog } from '/components/lib/icons/icon-blog';
import { IconStream } from '/components/lib/icons/icon-stream';
import { getQueryParams, collectionAuthorization, profileUrl, getLoadingClass } from '/lib/util';
import { getStationDetails } from '/services';
import { Button } from '/components/lib/button';
import { REPORT_PAGE_STATUS, PAGE_STATUS_TRANSITIONING, PAGE_STATUS_READY, PAGE_STATUS_PROCESSING, PAGE_STATUS_RECONNECTING } from '/lib/constants';
import classnames from 'classnames';
import _ from 'lodash';

export class Header extends Component {
  constructor(props) {
    super(props);

    this.toggleSubscribe = this.toggleSubscribe.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.reconnectPolling = this.reconnectPolling.bind(this);
  }

  isSubscribed(station) {
    let inboxSrc = this.props.store.messages.inbox.src;
    if (!inboxSrc) return false;
    return inboxSrc.includes(station);
  }

  toggleSubscribe(station) {
    let subscribed = this.isSubscribed(station);
    let stationDetails = getStationDetails(this.props.data.station);

    this.props.api.hall({
      source: {
        nom: 'inbox',
        sub: !subscribed,
        srs: [this.props.data.station]
      }
    });
  }

  toggleMenu() {
    this.props.storeReports([{
      type: "menu.toggle",
      data: {open: true}
    }]);
  }

  reconnectPolling() {
    this.props.storeReports([{
      type: REPORT_PAGE_STATUS,
      data: PAGE_STATUS_RECONNECTING
    }]);
    this.props.runPoll();
  }

  getStationHeaderData(station) {
    let stationDetails = getStationDetails(station);

    return {
      title: {
        display: stationDetails.stationTitle,
        href: stationDetails.stationUrl
      },
      breadcrumbs: [{
        display: `~${stationDetails.host}`,
        href: stationDetails.hostProfileUrl
      }],
      station,
      stationDetails
    }
  }

  getHeaderData(type) {
    let headerData = {};
    let defaultData;
    let actions = {};

    switch (type) {
      case "stream":
        defaultData = this.getStationHeaderData(this.props.data.station);
        headerData = {
          ...defaultData,
          icon: IconStream,
          title: {
            ...defaultData.title,
            style: "mono"
          },
          actions: {
            details: defaultData.stationDetails.stationDetailsUrl,
          },
        }
        break;

      case "collection-index":
        defaultData = this.getStationHeaderData(this.props.data.station);

        if (this.props.data.collectionPageMode === 'default') {
          actions = {
            details: `/~~/${this.props.data.owner}/==/web/collections/${this.props.data.collId}?show=details`,
            write: `/~~/${this.props.data.owner}/==/web/collections/${this.props.data.collId}?show=post`,
          }
        } else if (this.props.data.collectionPageMode === 'details') {
          actions = {
            back: `/~~/${this.props.data.owner}/==/web/collections/${this.props.data.collId}`,
          }
        }

        headerData = {
          ...defaultData,
          icon: IconBlog,
          title: {
            ...defaultData.title,
            display: (this.props.data.title) ? this.props.data.title : defaultData.title.display
          },
          actions: actions
        }
        break;

      case "collection-post":
        defaultData = this.getStationHeaderData(this.props.data.station);

        if (this.props.data.collectionPageMode === 'default') {
          actions = {
            details: `/~~/${this.props.data.owner}/==/web/collections/${this.props.data.collId}/${this.props.data.postId}?show=details`,
            edit: `/~~/${this.props.data.owner}/==/web/collections/${this.props.data.collId}/${this.props.data.postId}?show=edit`
          }
        } else if (this.props.data.collectionPageMode === 'details') {
          actions = {
            back: `/~~/${this.props.data.owner}/==/web/collections/${this.props.data.collId}/${this.props.data.postId}`,
          }
        }

        headerData = {
          ...defaultData,
          icon: IconBlog,
          title: {
            ...defaultData.title,
            display: (this.props.data.title) ? this.props.data.title : defaultData.title.display
          },
          breadcrumbs: [
            defaultData.breadcrumbs[0],
            {
              display: this.props.data.collTitle,
              href: `/~~/${this.props.data.owner}/==/web/collections/${this.props.data.collId}`
            }
          ],
          actions: actions
        }
        break;

      case "profile":
        headerData = {
          title: {
            display: this.props.data.owner,
            href: profileUrl(this.props.data.owner.substr(1)),
            style: "mono"
          }
        }
        break;

      case "dm":
      case "edit":
      case "default":
      default:
        headerData = {
          title: {
            display: "Inbox",
            href: "/~~/landscape"
          }
        }
        break;
    }

    return headerData;
  }

  buildHeaderContent(headerData) {
    let actions, subscribeClass, subscribeLabel, iconElem, breadcrumbsElem, headerClass, loadingClass;

    if (headerData.station) {
      subscribeClass = (this.isSubscribed(headerData.station)) ? "btn-secondary" : "btn-primary";
      subscribeLabel = (this.isSubscribed(headerData.station)) ? "Unsubscribe" : "Subscribe";
    }

    if (headerData.actions) {
      actions = Object.arrayify(headerData.actions).map(({key, value}) => {
        return (<a key={key} href={value} className="header-link mr-6">{key}</a>)
      })
    }

    if (headerData.breadcrumbs) {
      breadcrumbsElem = headerData.breadcrumbs.map(({display, href}, i) => {
        return (
          <React.Fragment>
            <a className="header-link header-link-breadcrumb" key={display} href={href}>{display}</a>
            <span className="header-link header-link-breadcrumb ml-2 mr-2">/</span>
          </React.Fragment>
        )
      })
    }

    iconElem = headerData.icon ? <headerData.icon /> : <div style={{width: "24px", height: "24px"}}></div>;
    loadingClass = getLoadingClass(this.props.store.views.transition);
    headerClass = classnames({
      'flex-3rd': true,
      'header-title': true,
      'header-title-mono': headerData.title && headerData.title.style === "mono"
    })

    return (
      <div>
        <div className="row">
          <div className="col-sm-offset-2 col-sm-10 header-breadcrumbs">
            {breadcrumbsElem}
          </div>
        </div>
        <div className="flex align-center header-mainrow">
          <div onClick={this.reconnectPolling} className={loadingClass}></div>
          <a onClick={this.toggleMenu} className="flex-1st">
            <div className="panini"></div>
          </a>
          <div className="flex-2nd">{iconElem}</div>
          <h3 className={headerClass}><a href={headerData.title.href}>{headerData.title.display}</a></h3>
          {actions}
          {headerData.station &&
            <Button
              classes={`btn btn-sm ${subscribeClass}`}
              action={this.toggleSubscribe}
              content={subscribeLabel}
              pushCallback={this.props.pushCallback}
              responseKey="circle.config.dif.source"
               />
          }
        </div>
      </div>
    )
  }

  render() {
    let type = (this.props.data.type) ? this.props.data.type : "default";

    // TODO: This is an ugly hack until we fix queryParams
    if (["stream", "dm", "collection-write"].includes(type) && !getQueryParams().station) {
      return null;
    }

    let headerData = this.getHeaderData(type);
    let headerContent = this.buildHeaderContent(headerData);

    return (
      <div className="container header-container">
        {headerContent}
      </div>
    )
  }
}
