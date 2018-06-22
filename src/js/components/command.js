import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import { CommandHelpItem } from '/components/command/help-item';
import { getStationDetails } from '/lib/util';

export class CommandMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      command: "",
      options: [],
      selectedOption: null
    };

    this.onCommandChange = this.onCommandChange.bind(this);

    this.commandInputRef = React.createRef();
  }

  componentDidMount() {
    if (this.state.options.length === 0) {
      this.setState({
        options: this.getOptionList(this.state.command)
      });
    }

    Mousetrap.bind('down', (e) => {
      let option;
      if (e.preventDefault) e.preventDefault();

      if (this.state.selectedOption === null) {
        option = 0
      } else if (this.state.selectedOption === (this.state.options.length - 1)) {
        option = (this.state.options.length - 1);
      } else {
        option = this.state.selectedOption + 1;
      }

      this.setState({
        selectedOption: option
      });
    });

    Mousetrap.bind('up', (e) => {
      let option;
      if (e.preventDefault) e.preventDefault();

      if (this.state.selectedOption === null || this.state.selectedOption === 0) {
        option = 0;
      } else {
        option = this.state.selectedOption - 1;
      }

      this.setState({
        selectedOption: option
      });
    });

    Mousetrap.bind('enter', (e) => {
      if (this.state.selectedOption !== null) {
        this.processCommand(this.state.options[this.state.selectedOption]);
      }
    })
  }

  componentWillUnmount() {
    Mousetrap.unbind('down');
    Mousetrap.unbind('up');
  }

  onCommandChange(e) {
    this.setState({
      command: e.target.value,
      options: this.getOptionList(e.target.value),
      selectedOption: 0
    });
  }

  hasHelpToken(cmd) {
    return cmd.split(" ").includes("?");
  }

  processCommand(option) {
    if (typeof option.action === "string") {
      this.onCommandChange({target: { value: option.action}});
    } else if (typeof option.action === "function") {
      option.action();
    }
  }

  getDirectiveOptionsList() {
    return {
      go: this.getGoOptionList(),
      dm: this.getDmOptionList(),
      "new": this.getNewOptionList()
    };
  }

  getGoOptionList() {
    let options = [];

    Object.arrayify(this.props.store.names).forEach(({key: ship, value: stations}) => {
      stations.forEach(station => {
        let stationName = `~${ship}/${station}`;
        let details = getStationDetails(stationName, this.props.store.configs[stationName], this.props.api.authTokens.ship);

        let displayText = details.station.split("/").join("  /  ");

        options.push({
          name: `go ${details.station}`,
          action: () => {
            console.log('this? = ', this);
            this.props.transitionTo(details.stationUrl);
          },
          displayText: displayText,
          helpText: `Go to ${station} on ~${ship}`,
        });
      });
    });

    return options;
  }

  getDmOptionList() {
    let options = [];

    Object.keys(this.props.store.names).forEach(name => {
      options.push({
        name: `dm ~${name}`,
        action: () => {
          // TODO: This should check for existing DM circles & redirect to that
          this.props.transitionTo(`/~~/pages/nutalk/stream/create?dm=~${name}`);
        },
        displayText: `dm ~${name}`,
        helpText: `Send a direct message to ~${name}`
      });
    });

    return options;
  }

  getNewOptionList() {
    return [{
      name: "new collection",
      action: () => {
        this.props.transitionTo("/~~/pages/nutalk/collection/create");
      },
      displayText: "new collection",
      helpText: "Create a new collection of markdown files"
    }, {
      name: "new chat",
      action: () => {
        this.props.transitionTo("/~~/pages/nutalk/stream/create");
      },
      displayText: "new chat",
      helpText: "Create a chatroom"
    }];
  }

  getRootOptionList() {
    return [{
      name: "inbox",
      action: () => {
        this.props.transitionTo('/~~/pages/nutalk');
      },
      displayText: "inbox",
      helpText: "Go to the inbox",
    }, {
      name: "profile",
      action: () => {
        this.props.transitionTo(`/~~/~${this.props.api.authTokens.ship}/==/web/pages/nutalk/profile`);
      },
      displayText: "profile",
      helpText: "Go to your profile. Settings and log out are also here",
    }, {
      name: "go",
      action: "go ~",
      displayText: "go [~ship/stream]",
      helpText: "Go to <stream> on <~ship>",
    }, {
      name: "go",
      action: "go ~",
      displayText: "go [~ship/collection]",
      helpText: "Go to <collection> on <~ship>",
    }, {
      name: "dm",
      action: "dm ~",
      displayText: "dm [~ship]",
      helpText: "Go to your dm with <~ship>, or start a new dm with <~ship>",
    }, {
      name: "dm",
      action: "dm ~",
      displayText: "dm [~ship-a, ~ship-b, ~ship-c]",
      helpText: "Go to your dm with a group of <[~ship-a, ~ship-b, ~ship-c]>, or start a new dm with <[~ship-a, ~ship-b, ~ship-c]>",
    }, {
      name: "new",
      action: "new",
      displayText: "new [type]",
      helpText: "Create a new blog, forum, or chat",
    }];
  }

  getDirective(cmd, options) {
    let tokens = cmd.split(" ");
    let directive = tokens[0];

    // for 1st type, must be a valid directive *and* have a non-empty second token
    let hasSecondToken = (Object.keys(options).includes(directive)
                          && tokens.length > 1
                          && tokens[1] !== ""
                          && tokens[1] !== "?");

    if (hasSecondToken || directive === "new") {
      return directive;
    }
    return null;
  }

  getOptionList(cmd) {
    let options;

    let directiveOptions = this.getDirectiveOptionsList();
    let directive = this.getDirective(cmd, directiveOptions);

    if (directive) {
      options = directiveOptions[directive];
    } else {
      options = this.getRootOptionList();
    }

    options = options.filter(opt => opt.name.includes(this.trimCmd(cmd)));

    return options;
  }

  trimCmd(cmd) {
    if (this.hasHelpToken(cmd)) {
      let tokens = cmd.split(" ");
      tokens.splice(tokens.indexOf("?"), 1);
      return tokens.join(" ").trim();
    }

    return cmd.trim();
  }

  buildOptions(optionList) {
    return optionList.map((option, index) => {
      let selected = index === this.state.selectedOption;
      let helpActivated = this.hasHelpToken(this.state.command);

      return (
        <CommandHelpItem
          option={option}
          selected={selected}
          processCommand={this.processCommand.bind(this)}
          helpActivated={helpActivated}
        />
      );
    });
  }

  render() {
    let optionElems = this.buildOptions(this.state.options);

    if (this.commandInputRef.current) this.commandInputRef.current.focus();

    return (
      <div className="container menu-page">
        <div className="row">
          <div className="col-sm-1">
            <div className="cross" onClick={this.crossClick}></div>
          </div>
          <div className="col-sm-11">
            <input type="text"
                   name="command-input"
                   className="command-menu-input"
                   placeholder="type a command, page or ? for help"
                   onChange={this.onCommandChange}
                   onSubmit={this.onCommandSubmit}
                   value={this.state.command}
                   ref={this.commandInputRef}/>

            <div className="mt-12">
              {optionElems}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
