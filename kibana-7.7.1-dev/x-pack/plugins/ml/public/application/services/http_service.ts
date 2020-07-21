/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Observable } from 'rxjs';
import { HttpFetchOptionsWithPath, HttpFetchOptions } from 'kibana/public';
import { getHttp } from '../util/dependency_cache';

function getResultHeaders(headers: HeadersInit): HeadersInit {
  return {
    asSystemRequest: true,
    'Content-Type': 'application/json',
    ...headers,
  } as HeadersInit;
}

function getFetchOptions(
  options: HttpFetchOptionsWithPath
): { path: string; fetchOptions: HttpFetchOptions } {
  if (!options.path) {
    throw new Error('URL path is missing');
  }
  return {
    path: options.path,
    fetchOptions: {
      credentials: 'same-origin',
      method: options.method || 'GET',
      ...(options.body ? { body: options.body } : {}),
      ...(options.query ? { query: options.query } : {}),
      headers: getResultHeaders(options.headers ?? {}),
    },
  };
}

/**
 * Function for making HTTP requests to Kibana's backend.
 * Wrapper for Kibana's HttpHandler.
 */
export async function http<T>(options: HttpFetchOptionsWithPath): Promise<T> {
  const { path, fetchOptions } = getFetchOptions(options);
  return getHttp().fetch<T>(path, fetchOptions);
}

/**
 * Function for making HTTP requests to Kibana's backend which returns an Observable
 * with request cancellation support.
 */
export function http$<T>(options: HttpFetchOptionsWithPath): Observable<T> {
  const { path, fetchOptions } = getFetchOptions(options);
  return fromHttpHandler<T>(path, fetchOptions);
}

/**
 * Creates an Observable from Kibana's HttpHandler.
 */
export function fromHttpHandler<T>(input: string, init?: RequestInit): Observable<T> {
  return new Observable<T>((subscriber) => {
    const controller = new AbortController();
    const signal = controller.signal;

    let abortable = true;
    let unsubscribed = false;

    if (init?.signal) {
      if (init.signal.aborted) {
        controller.abort();
      } else {
        init.signal.addEventListener('abort', () => {
          if (!signal.aborted) {
            controller.abort();
          }
        });
      }
    }

    const perSubscriberInit: RequestInit = {
      ...(init ? init : {}),
      signal,
    };

    getHttp()
      .fetch<T>(input, perSubscriberInit)
      .then((response) => {
        abortable = false;
        subscriber.next(response);
        subscriber.complete();
      })
      .catch((err) => {
        abortable = false;
        if (!unsubscribed) {
          subscriber.error(err);
        }
      });

    return () => {
      unsubscribed = true;
      if (abortable) {
        controller.abort();
      }
    };
  });
}