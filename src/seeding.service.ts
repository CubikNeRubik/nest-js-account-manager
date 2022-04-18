import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Person } from './entities/person.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly entityManager: EntityManager) {}

  async seed(): Promise<void> {
    await this.entityManager.save(Person, {
      personId: 1,
      name: 'John Doe',
      document: 'html',
      birthDate: new Date(),
    });
  }
}
