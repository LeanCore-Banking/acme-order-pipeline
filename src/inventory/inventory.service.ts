import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '@/inventory/inventory.entity';
import { LoggerProviderService } from  '@/providers/logger/logger.provider.service'

@Injectable()
export class InventoryService {
  private context: string;

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly logger: LoggerProviderService,
  ) {
    this.context = InventoryService.name;
  }

  async reserve(reservedProducts: { productId: string; quantity: number }[]): Promise<Inventory[]> {
    try {
      const inventoriesUpdated: Inventory[] = [];

      for (const item of reservedProducts) {
        this.logger.log(
          this.context,
          `Reserving ${item.quantity} units for product ID: ${item.productId}`,
        );

        const inventory = await this.inventoryRepository.findOne({
          where: { product_id: item.productId },
        });
        if (!inventory) throw new BadRequestException(`Product ${item.productId} not found`);

        if (inventory.available_quantity - inventory.reserved_quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
        }

        inventory.reserved_quantity += item.quantity;
        const updated = await this.inventoryRepository.save(inventory);
        inventoriesUpdated.push(updated);

        this.logger.debug(this.context, 'Inventory updated', JSON.stringify(updated));
      }

      return inventoriesUpdated;
    } catch (error) {
      this.logger.error(this.context, JSON.stringify(error));
      throw error;
    }
  }

  async decrementStock(products: { productId: string; quantity: number }[]): Promise<Inventory[]> {
    const updatedInventories: Inventory[] = [];

    for (const item of products) {
      const inventory = await this.inventoryRepository.findOne({
        where: { product_id: item.productId },
      });
      if (!inventory) throw new BadRequestException(`Product ${item.productId} not found`);

      if (inventory.reserved_quantity < item.quantity) {
        throw new BadRequestException(
          `Reserved quantity less than decrement for ${item.productId}`,
        );
      }

      inventory.available_quantity -= item.quantity;
      inventory.reserved_quantity -= item.quantity;
      const updated = await this.inventoryRepository.save(inventory);
      updatedInventories.push(updated);

      this.logger.log(
        this.context,
        `Decremented ${item.quantity} units from product ID: ${item.productId}`,
      );
    }

    return updatedInventories;
  }

  async revertReservation(
    products: { productId: string; quantity: number }[],
  ): Promise<Inventory[]> {
    const revertedInventories: Inventory[] = [];

    for (const item of products) {
      const inventory = await this.inventoryRepository.findOne({
        where: { product_id: item.productId },
      });
      if (!inventory) continue;

      inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
      const updated = await this.inventoryRepository.save(inventory);
      revertedInventories.push(updated);

      this.logger.log(
        this.context,
        `Reverted reservation of ${item.quantity} units for product ID: ${item.productId}`,
      );
    }

    return revertedInventories;
  }
}
