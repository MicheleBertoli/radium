/* @flow */

import cssRuleSetToString from '../css-rule-set-to-string';

import React, {PropTypes} from 'react';

const Style = React.createClass({
  propTypes: {
    radiumConfig: PropTypes.object,
    rules: PropTypes.object,
    scopeSelector: PropTypes.string
  },

  contextTypes: {
    _radiumConfig: PropTypes.object
  },

  getDefaultProps(): {scopeSelector: string} {
    return {
      scopeSelector: ''
    };
  },

  _buildStyles(styles: Object): string {
    const userAgent = (
      this.props.radiumConfig && this.props.radiumConfig.userAgent
    ) || (
      this.context &&
      this.context._radiumConfig &&
      this.context._radiumConfig.userAgent
    );

    return Object.keys(styles).reduce((accumulator, selector) => {
      const {scopeSelector} = this.props;
      const rules = styles[selector];

      if (selector === 'mediaQueries') {
        accumulator += this._buildMediaQueryString(rules);
      } else if (typeof styles[selector] !== 'object') {
        // If the selector is actually a rule, and not a selector,
        // prefix it with the scopeSelector
        accumulator += cssRuleSetToString(
          scopeSelector || '',
          { [selector]: rules },
          userAgent
        );
      } else {
        const completeSelector = scopeSelector
          ? selector
            .split(',')
            .map(part => scopeSelector + ' ' + part.trim())
            .join(',')
          : selector;

        accumulator += cssRuleSetToString(completeSelector, rules, userAgent);
      }

      return accumulator;
    }, '');
  },

  _buildMediaQueryString(
    stylesByMediaQuery: {[mediaQuery: string]: Object}
  ): string {
    let mediaQueryString = '';

    Object.keys(stylesByMediaQuery).forEach(query => {
      mediaQueryString += '@media ' + query + '{' +
        this._buildStyles(stylesByMediaQuery[query]) +
        '}';
    });

    return mediaQueryString;
  },

  render(): ?ReactElement {
    if (!this.props.rules) {
      return null;
    }

    const styles = this._buildStyles(this.props.rules);

    return (
      <style dangerouslySetInnerHTML={{__html: styles}} />
    );
  }
});

export default Style;
