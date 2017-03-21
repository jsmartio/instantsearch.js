

import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectStats from '../connectStats.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectStats', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectStats(rendering);

    const widget = makeWidget({
      container,
    });

    expect(widget.getConfiguration).toEqual(undefined);

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    { // should call the rendering once with isFirstRendering to true
      expect(rendering.callCount).toBe(1);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const {containerNode, hitsPerPage, nbHits, nbPages, page,
        processingTimeMS, query, collapsible, shouldAutoHideContainer} = rendering.lastCall.args[0];
      expect(containerNode).toBe(container);
      expect(hitsPerPage).toBe(helper.state.hitsPerPage);
      expect(nbHits).toBe(0);
      expect(nbPages).toBe(0);
      expect(page).toBe(helper.state.page);
      expect(processingTimeMS).toBe(-1);
      expect(query).toBe(helper.state.query);
      expect(collapsible).toBe(false);
      expect(shouldAutoHideContainer).toBe(true);
    }

    widget.render({
      results: new SearchResults(helper.state, [{
        hits: [{One: 'record'}],
        nbPages: 1,
        nbHits: 1,
        hitsPerPage: helper.state.hitsPerPage,
        page: helper.state.page,
        query: helper.state.query,
        processingTimeMS: 12,
      }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    { // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.callCount).toBe(2);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const {containerNode, hitsPerPage, nbHits, nbPages, page,
        processingTimeMS, query, collapsible, shouldAutoHideContainer} = rendering.lastCall.args[0];
      expect(containerNode).toBe(container);
      expect(hitsPerPage).toBe(helper.state.hitsPerPage);
      expect(nbHits).toBe(1);
      expect(nbPages).toBe(1);
      expect(page).toBe(helper.state.page);
      expect(processingTimeMS).toBe(12);
      expect(query).toBe(helper.state.query);
      expect(collapsible).toBe(false);
      expect(shouldAutoHideContainer).toBe(false);
    }
  });
});