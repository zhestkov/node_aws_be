import { ProductInput } from '@functions/post-product/inputSchema';
import { validateOnCreate } from '@functions/post-product/validators';
import Utils from '@libs/utils';
import { Client } from 'pg';
import DatabaseError from 'src/exceptions/DatabaseException';
import ProductNotFoundError from 'src/exceptions/ProductNotFoundException';

export default class ProductService {
  client: Client;
  
  constructor() {
    this.client = new Client(Utils.getDbOptions());
  }

  async createProduct(product: ProductInput) {
    // validateOnCreate(product);
    try {
      if (product.count == null) {
        product.count = 1;
      }
      const { title, price, description, count } = product;
      console.log("product to save: ", product);
      const productQueryValues = [title, description, price];
      await this.client.connect();
      // save product
      await this.client.query(`
      insert into product(title, description, price) values
      ($1, $2, $3)
      `, productQueryValues);

      const createdProductId = (await this.client.query(`
      select id
      from product p
      where p.title = $1
      `, [title])).rows[0].id;

      console.log("created product id", createdProductId);

      // save stock
      const stockQueryValues = [createdProductId, count];
      await this.client.query(`
      insert into stock(product_id, count) values
      ($1, $2)
      `, stockQueryValues);
      // return this.getProductById(createdProductId);
    } catch(err) {
      console.log(err);
      throw new DatabaseError("Something went wrong while creating new product");
    } finally {
      this.client.end();
    }
  }

  async getProductList() {
    try {
      await this.client.connect();
      const { rows: products } = await this.client.query(`
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
      this.client.end();
    }
  }

  async getProductByTitle(title: string) {
    try {
      await this.client.connect();
      const queryValues = [title];
      const { rows: foundProducts } = await this.client.query(`
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
      throw new DatabaseError("Something went wrong while searching product by title");
    } finally {
      this.client.end();
    }
  }

  async getProductById(id: string) {
    try {
      if (!Utils.isUUIDValid(id)) {
        throw new ProductNotFoundError(`Product with id = '${id}' was not found (invalid format)`);
      }
      await this.client.connect();
      const queryValues = [id];
      const { rows } = await this.client.query(`
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
      this.client.end();
    }
  }
}