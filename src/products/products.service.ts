import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}

  async create(createProductDto: CreateProductDto) {
    try{

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save( product );
      
      return product;
      
    } catch(error){
      this.handleDBExeption(error);
    } 
  }

  findAll(paginationDto: PaginationDto) {
    
    const {limit = 10, offset= 0} = paginationDto

    return this.productRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {
    try{ 

      let product: Product;

      if(isUUID(term)){
        product = await this.productRepository.findOne({
         where:{id: term}
        })
      }else{
        // product = await this.productRepository.findOne({
        //  where:{slug: term}
        // })

        const queryBuiler = this.productRepository.createQueryBuilder();

        product = await queryBuiler.where('lowercase(title) = :title or slug=:slug',{
          title: term.toLocaleLowerCase(),
          slug: term
        }).getOne();

      }


      if(!product)
        throw new NotFoundException({
          code: 400,
          detail: 'Not found object with this id',
          column: 'uuid'
        });

      return product;

    }catch(error){
      this.handleDBExeption(error)
    }
  }

  async update(id: string, _updateProductDto: UpdateProductDto) {
    try{

      const product = await this.productRepository.preload({
        id,
        ..._updateProductDto
      })
  
      if(! product)  throw new NotFoundException({
        code: 400,
        detail: 'Not found object with this id',
        column: 'uuid'
      });
  
      await this.productRepository.save(product);

      return product;

    }catch(error){
      this.handleDBExeption(error);
    }
  }

  async remove(id: string) {
    let product = await this.findOne(id);
    console.log(product);
    return this.productRepository.remove(product);
  }

  private handleDBExeption(_error : any){
    
    this.logger.error(_error);

    if(_error.response)
      _error = _error.response

    let error:DBError = {
      code: +_error.code,
      column: _error.column,
      detail: _error.detail,
    }

    switch(error.code){
      case 400:
        throw new NotFoundException(error);
      case 16360:
        throw new BadRequestException(error);
      case 23505:
        throw new BadRequestException(error);
      default:
        throw new InternalServerErrorException(`Unexpected error:  ${_error.driverError}`)
    }
    
  } 


}
