import { Injectable } from '@nestjs/common';
import { TransactionType } from '../point/point.model';

@Injectable()
export class QueueTable {
  // 포인트 충전에 대한 동시성 제어
  private readonly queue: Map<number, Array<QueueRequest>> = new Map();

  // queue에 요청을 추가하는 함수
  push(userId: number, req: QueueRequest) {
    const userQueue = this.queue.get(userId);
    console.log('push', userQueue);
    if (userQueue == undefined) {
      this.queue.set(userId, [req]);
    } else {
      this.queue.set(userId, [...userQueue, req]);
    }
    console.log(this.queue);
  }

  get(userId: number): QueueRequest[] {
    return this.queue.get(userId);
  }

  pop(userId: number): QueueRequest {
    const origin = this.queue.get(userId);
    const poped = origin[0];
    this.queue.set(
      userId,
      origin.filter((q) => q.queueId != poped.queueId),
    );
    return poped;
  }
}

type QueueRequest = {
  queueId: number;
  type: TransactionType;
  amount: number;
};
