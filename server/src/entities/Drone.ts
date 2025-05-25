import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pilot } from './Pilot';
import { FlightRequest } from './FlightRequest';

@Entity()
export class Drone {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  brand!: string;

  @Column()
  model!: string;

  @Column()
  serial_number!: string;

  @Column({ default: true })
  is_active!: boolean;

  @ManyToOne(() => Pilot, pilot => pilot.drones, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pilot_id' })
  pilot!: Pilot;

  @OneToMany(() => FlightRequest, fr => fr.drone)
  flightRequests!: FlightRequest[];

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  pos?: string; // или GeoJSON, в зависимости от вашей конфигурации

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}