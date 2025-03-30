/**
 * 引数ミリ秒処理を止める
 *
 * @param milliseconds ミリ秒
 * @returns
 */
export const sleepMilliSeconds = (milliseconds: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};
