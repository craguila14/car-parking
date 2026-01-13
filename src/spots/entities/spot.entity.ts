import { Reservation } from 'src/reservations/entities/reservation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('spots')
export class Spot {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  identifier: string; // Ej: "A-01"

  @Column({ default: true })
  isActive: boolean; // Si el lugar está habilitado para uso

  @Column({ default: false })
  isSpecial: boolean; // Para camionetas o el "margen de emergencia" que hablamos

  @OneToMany(() => Reservation, (reservation) => reservation.spot)
  reservations: Reservation[];
}