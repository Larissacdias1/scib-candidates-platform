import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type Seniority = 'intern' | 'trainee' | 'junior' | 'mid' | 'senior';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  surname: string;

  @Column({ type: 'varchar', length: 20 })
  seniority: Seniority;

  @Column({ type: 'int' })
  yearsOfExperience: number;

  @Column({ type: 'boolean', default: false })
  availability: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
