import { Spot } from 'src/spots/entities/spot.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ReservationStatus {
  PENDING = 'pending',     
  CONFIRMED = 'confirmed', 
  ACTIVE = 'active',       
  COMPLETED = 'completed', 
  CANCELLED = 'cancelled',
  MODIFICATION_REQUESTED = 'mod_requested', 
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.reservations, {nullable: true})
  user: User;

  @ManyToOne(() => Spot, (spot) => spot.reservations)
  spot: Spot;

  @Column({ type: 'timestamp', nullable: true })
  startTimeScheduled: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTimeScheduled: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualCheckIn: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualCheckOut: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  modificationCount: number; 

  @UpdateDateColumn()
  updatedAt: Date; 
}