import { ProductInput } from '@functions/post-product/inputSchema';
import { validateOnCreate } from '@functions/post-product/validators';
import Utils from '@libs/utils';
import { Pool } from 'pg';
import DatabaseError from 'src/exceptions/DatabaseException';
import ProductNotFoundError from 'src/exceptions/ProductNotFoundException';

export default class ProductService {
  pool: Pool;
  
  constructor() {
    this.pool = new Pool(Utils.getDbOptions())
  }

  async closePool() {
    await this.pool.end();
  }


  async createProduct(product: ProductInput) {
    await validateOnCreate(this, product);
    const client = await this.pool.connect();
    // todo: add transaction
    try {
      if (product.count == null) {
        product.count = 1;
      }
      const { title, price, description, count } = product;
      const productQueryValues = [title, description, price];
      // save product
      const createdProductId = (await client.query(`
      insert into product(title, description, price) values
      ($1, $2, $3) returning id
      `, productQueryValues)).rows[0].id;

      // save stock
      const stockQueryValues = [createdProductId, count];
      await client.query(`
      insert into stock(product_id, count) values
      ($1, $2)
      `, stockQueryValues);
      return this.getProductById(createdProductId);
    } catch(err) {
      throw new DatabaseError("Something went wrong while creating new product");
    } finally {
      client.release();
    }
  }

  async getProductList() {
    const client = await this.pool.connect();
    try {
      
      const { rows: products } = await client.query(`
      select 
        p.id as id,
        p.title as title,
        p.description as description,
        p.price as price,
        s.count as count
      from product p 
      join stock s 
      on p.id = s.product_id
      `);

      return products;
    } catch(err) {
      throw new DatabaseError("Something went wrong while fetching product list from DB");
    } finally {
      client.release();
    }
  }

  async getProductWithStockByTitle(title: string) {
    const client = await this.pool.connect();
    try {
      const queryValues = [title];
      const { rows: foundProducts } = await client.query(`
      select 
        p.id as id,
        p.title as title,
        p.description as description,
        p.price as price,
        s.count as count
      from product p 
      join stock s 
      on p.id = s.product_id
      where p.title = $1
      `, queryValues);
      return foundProducts.length
        ? foundProducts[0]
        : null;
    } catch(err) {
      throw new DatabaseError("Something went wrong while searching full product info by title");
    } finally {
      client.release();
    }
  }

  async getProductByTitle(title: string) {
    const client = await this.pool.connect();
    try {
      const queryValues = [title];
      const { rows: foundProducts } = await client.query(`
      select * from product p
      where p.title = $1
      `, queryValues);
      return foundProducts.length
        ? foundProducts[0]
        : null;
    } catch(err) {
      throw new DatabaseError("Something went wrong while searching product by title");
    } finally {
      client.release();
    }
  }

  async getProductById(id: string) {
    const client = await this.pool.connect();
    try {
      if (!Utils.isUUIDValid(id)) {
        throw new ProductNotFoundError(`Product with id = '${id}' was not found (invalid format)`);
      }
      
      const queryValues = [id];
      const { rows } = await client.query(`
      select 
        p.id as id,
        p.title as title,
        p.description as description,
        p.price as price,
        s.count as count
      from product p 
      join stock s 
      on p.id = s.product_id
      where p.id = $1
      `, queryValues);

      if (!rows.length) {
        throw new ProductNotFoundError(`Product with id = '${id}' was not found`);
      }
      return rows[0];
    } catch(err) {
      if (err instanceof ProductNotFoundError) {
        throw err;
      } else {
        throw new DatabaseError("Something went wrong while fetching product by ID");
      }
    } finally {
      client.release();
    }
  }
}