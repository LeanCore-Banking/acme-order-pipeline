import { EventType } from '@/common/enum';
import { Entity, ObjectIdColumn, ObjectId, Column, Index } from 'typeorm';

@Entity('order_events')
@Index(['order_id', 'timestamp'])
@Index(['event_type'])
@Index(['timestamp'])
export class OrderEvent {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  order_id: string;

  @Column()
  event_type: EventType;

  @Column()
  timestamp: Date;
}
