import { Collection, ObjectId, SortDirection } from 'mongodb';
import {
  CursorPaginatedResponse,
  LimitOffsetPaginatedReponse,
} from './@types/nest.types';
import * as crypto from 'node:crypto';

export async function getCursorPaginatedResponse<T = any>(
  collection: Collection<any>,
  filter: Record<string, any>,
  projection: Record<string, any>,
  sortField: string,
  sortType: SortDirection,
  pageSize: number,
  before?: string,
  after?: string,
): Promise<CursorPaginatedResponse<T>> {
  let results;
  let next: ObjectId;
  let prev: ObjectId;
  const itemsPerPage = pageSize + 1;
  const sort = {
    [sortField]: sortType,
  };

  if (before) {
    if (sortType === 1) {
      results = await collection
        .find(
          { ...filter, _id: { $lt: new ObjectId(before) } },
          { projection, limit: itemsPerPage, sort },
        )
        .toArray();
    } else {
      results = await collection
        .find(
          { ...filter, _id: { $gt: new ObjectId(before) } },
          { projection, limit: itemsPerPage, sort },
        )
        .toArray();
    }
    if (results.length === itemsPerPage) {
      prev = results[1]._id;
      results = results.slice(1);
    }
    next = results[results.length - 1]._id;
  }

  if (after) {
    if (sortType === 1) {
      results = await collection
        .find(
          { ...filter, _id: { $gt: new ObjectId(after) } },
          { projection, limit: itemsPerPage, sort },
        )
        .toArray();
    } else {
      results = await collection
        .find(
          { ...filter, _id: { $lt: new ObjectId(after) } },
          { projection, limit: itemsPerPage, sort },
        )
        .toArray();
    }
    if (results.length === itemsPerPage) {
      next = results[results.length - 2]._id;
      results = results.slice(0, -1);
    }
    prev = results[0]._id;
  }

  if (!before && !after) {
    results = await collection
      .find({ ...filter }, { projection, limit: itemsPerPage, sort })
      .toArray();
    if (results.length === itemsPerPage) {
      next = results[results.length - 2]._id;
      results = results.slice(0, -1);
    }
  }

  const count = await collection.countDocuments(filter);

  const response: CursorPaginatedResponse<T> = {
    results,
    count,
    before: prev?.toHexString(),
    after: next?.toHexString(),
  };

  return response;
}

export async function getLimitOffsetPaginatedResponse<T = any>(
  collection: Collection<any>,
  filter: Record<string, any>,
  projection: Record<string, any>,
  sortField: string,
  sortType: SortDirection,
  pageSize: number,
  page?: number,
): Promise<LimitOffsetPaginatedReponse<T>> {
  const sort = {
    [sortField]: sortType,
  };

  const [results, count] = await Promise.all([
    collection
      .find(filter, {
        projection,
        limit: pageSize,
        skip: (page - 1) * pageSize,
        sort,
      })
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    results,
    pages: Math.ceil(count / pageSize),
  };
}

/** *************************************************
 * RETRY FN WITH EXPONENTIAL BACKOFF
 ************************************************** */

/**
 * Wait for the given milliseconds
 * @param {number} milliseconds The given time to wait
 * @returns {Promise} A fulfilled promise after the given time has passed
 */
function waitFor(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Execute a promise and retry with exponential backoff
 * based on the maximum retry attempts it can perform
 * @param {Promise} promise promise to be executed
 * @param {function} onRetry callback executed on every retry
 * @param {number} maxRetries The maximum number of retries to be attempted
 * @returns {Promise} The result of the given promise passed in
 */
function retry(
  promise: () => Promise<any>,
  onRetry: () => void,
  maxRetries: number,
  initialDelay = 100,
) {
  // Notice that we declare an inner function here
  // so we can encapsulate the retries and don't expose
  // it to the caller. This is also a recursive function
  async function retryWithBackoff(retries) {
    try {
      // Make sure we don't wait on the first attempt
      if (retries > 0) {
        // Here is where the magic happens.
        // on every retry, we exponentially increase the time to wait.
        // Here is how it looks for a `maxRetries` = 4
        // (2 ** 1) * 100 = 200 ms
        // (2 ** 2) * 100 = 400 ms
        // (2 ** 3) * 100 = 800 ms
        const timeToWait = 2 ** retries * initialDelay;
        console.log(`waiting for ${timeToWait}ms...`);
        await waitFor(timeToWait);
      }
      return await promise();
    } catch (e) {
      // only retry if we didn't reach the limit
      // otherwise, let the caller handle the error
      if (retries < maxRetries) {
        onRetry?.();
        return retryWithBackoff(retries + 1);
      } else {
        console.warn('Max retries reached. Bubbling the error up');
        throw e;
      }
    }
  }

  return retryWithBackoff(0);
}

/** *************************************************
 * ENCRYPT / DECRYPT
 ************************************************** */

// Encrypt data using the symmetric key
function encryptData(data: string, key: string) {
  const keyBuf = Buffer.from(key, 'hex');
  const iv = crypto.randomBytes(16); // 16 bytes for AES
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuf, iv);
  const encryptedBuffer = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final(),
  ]);
  return {
    encryptedData: encryptedBuffer.toString('hex'),
    iv: iv.toString('hex'),
  };
}

// Decrypt data using the symmetric key and IV
function decryptData(encryptedData: string, key: string, iv: string) {
  const keyBuf = Buffer.from(key, 'hex');

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    keyBuf,
    Buffer.from(iv, 'hex'),
  );
  const decryptedBuffer = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final(),
  ]);
  return decryptedBuffer.toString('utf8');
}

export { retry as retryWithBackoff, encryptData, decryptData };
