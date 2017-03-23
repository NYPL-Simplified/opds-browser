import { expect } from "chai";
import { stub } from "sinon";

import reducer from "../auth";
import DataFetcher from "../../DataFetcher";
import ActionCreator from "../../actions";
import { adapter } from "../../OPDSDataAdapter";
import BasicAuthPlugin from "../../BasicAuthPlugin";

let fetcher = new DataFetcher({ adapter });
let actions = new ActionCreator(fetcher);

describe("auth reducer", () => {
  let initState = {
    showForm: false,
    callback: null,
    cancel: null,
    credentials: null,
    title: null,
    error: null,
    attemptedProvider: null,
    providers: null
  };

  it("returns the initial state", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles SHOW_AUTH_FORM", () => {
    let callback = stub();
    let cancel = stub();
    let provider = {
      name: "library",
      plugin: BasicAuthPlugin,
      method: {
        labels: {
          login: "barcode",
          password: "pin"
        }
      }
    };
    let action = actions.showAuthForm(callback, cancel, [provider], "library");
    let newState = Object.assign({}, initState, {
      showForm: true,
      callback: callback,
      cancel: cancel,
      title: "library",
      providers: [provider]
    });

    expect(reducer(initState, action)).to.deep.equal(newState);
  });

  it("handles SHOW_AUTH_FORM after error", () => {
    let callback = stub();
    let cancel = stub();
    let provider = {
      name: "library",
      plugin: BasicAuthPlugin,
      method: {
        labels: {
          login: "barcode",
          password: "pin"
        }
      }
    };
    let error = "Invalid Credentials";
    let attemptedProvider = "library";
    let action = actions.showAuthForm(callback, cancel, [provider], "library", error, attemptedProvider);
    let previousAttemptState = Object.assign({}, initState, { title: "library" });
    let newState = Object.assign({}, previousAttemptState, {
      showForm: true,
      callback: callback,
      cancel: cancel,
      title: "library",
      providers: [provider],
      error: error,
      attemptedProvider: attemptedProvider
    });

    expect(reducer(previousAttemptState, action)).to.deep.equal(newState);
  });

  it("handles HIDE_AUTH_FORM", () => {
    let oldState = Object.assign({}, initState, {
      showForm: true,
      error: "test error"
    });
    let action = actions.hideAuthForm();
    let newState = Object.assign({}, oldState, {
      showForm: false,
      error: null
    });

    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles SAVE_AUTH_CREDENTIALS", () => {
    let credentials = { provider: "test", credentials: "credentials" };
    let action = actions.saveAuthCredentials(credentials);
    let newState = Object.assign({}, initState, {
      credentials: credentials
    });

    expect(reducer(initState, action)).to.deep.equal(newState);
  });

  it("handles CLEAR_AUTH_CREDENTIALS", () => {
    let credentials = { provider: "test", credentials: "credentials" };
    let oldState = Object.assign({}, initState, {
      credentials: credentials
    });
    let action = actions.clearAuthCredentials();
    let newState = Object.assign({}, initState, {
      credentials: null
    });

    expect(reducer(oldState, action)).to.deep.equal(newState);
  });
});