/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { i18n } from '@kbn/i18n';
import reduce from '../lib/reduce.js';
import Chainable from '../lib/classes/chainable';

export default new Chainable('min', {
  args: [
    {
      name: 'inputSeries',
      types: ['seriesList'],
    },
    {
      name: 'value',
      types: ['seriesList', 'number'],
      help: i18n.translate('timelion.help.functions.min.args.valueHelpText', {
        defaultMessage:
          'Sets the point to whichever is lower, the existing value, or the one passed. ' +
          'If passing a seriesList it must contain exactly 1 series.',
      }),
    },
  ],
  help: i18n.translate('timelion.help.functions.minHelpText', {
    defaultMessage:
      'Minimum values of one or more series in a seriesList to each position, in each series, of the input seriesList',
  }),
  fn: function minFn(args) {
    return reduce(args, function (a, b) {
      return Math.min(a, b);
    });
  },
});