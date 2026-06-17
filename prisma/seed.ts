import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Dev@2026!', 12)

  await prisma.$transaction(async (prisma) => {
    await prisma.orderItem.deleteMany()
    await prisma.orderDraft.deleteMany()
    await prisma.productAttribute.deleteMany()
    await prisma.productImage.deleteMany()
    await prisma.productCategory.deleteMany()
    await prisma.analyticsEvent.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.brand.deleteMany()
    await prisma.adminUser.deleteMany()

    const categories = await Promise.all([
      {
        name: 'Estimulantes Femininos',
        slug: 'estimulantes-femininos',
        description: 'Seleção discreta pensada para momentos pessoais com conforto e suavidade.'
      },
      {
        name: 'Estimulantes Masculinos',
        slug: 'estimulantes-masculinos',
        description: 'Itens coordenados para cuidar do bem-estar em momentos íntimos.'
      },
      {
        name: 'Hot Balls',
        slug: 'hot-balls',
        description: 'Opções delicadas de peso e movimento para sensações controladas.'
      },
      {
        name: 'Anestésicos',
        slug: 'anesesicos',
        description: 'Produtos suaves para conforto localizado e uso controlado.'
      },
      {
        name: 'Produtos Comestíveis',
        slug: 'produtos-comestiveis',
        description: 'Aromas e sabores sutis para complementos especiais.'
      },
      {
        name: 'Lubrificantes',
        slug: 'lubrificantes',
        description: 'Texturas hidratantes para toque mais leve e confortável.'
      },
      {
        name: 'Cuidados Íntimos',
        slug: 'cuidados-intimos',
        description: 'Produtos de atenção pessoal para a rotina de bem-estar.'
      },
      {
        name: 'Acessórios',
        slug: 'acessorios',
        description: 'Itens práticos para uso discreto e armazenamento organizado.'
      },
      {
        name: 'Vibradores',
        slug: 'vibradores',
        description: 'Dispositivos suaves para estímulos ajustados ao seu ritmo.'
      }
    ].map((data) => prisma.category.create({ data })))

    const brands = await Promise.all([
      {
        name: 'JoFogo',
        slug: 'jofogo',
        description: 'Marca de desenvolvimento para testes internos.'
      },
      {
        name: 'Sensuale Dev',
        slug: 'sensuale-dev',
        description: 'Marca de desenvolvimento com foco em beleza discreta.'
      },
      {
        name: 'VivaBem Dev',
        slug: 'vivabem-dev',
        description: 'Marca de desenvolvimento para cuidado diário e conforto.'
      },
      {
        name: 'Noturna Dev',
        slug: 'noturna-dev',
        description: 'Marca de desenvolvimento para rotinas suaves à noite.'
      },
      {
        name: 'Diversos',
        slug: 'diversos',
        description: 'Coleção de itens variados para desenvolvimento e teste.'
      }
    ].map((data) => prisma.brand.create({ data })))

    const categoryMap = categories.reduce<Record<string, { id: string }>>((map, category) => {
      map[category.slug] = category
      return map
    }, {})

    const brandMap = brands.reduce<Record<string, { id: string }>>((map, brand) => {
      map[brand.slug] = brand
      return map
    }, {})

    const products = [
      {
        sku: 'JF-DEV-001',
        slug: 'produto-dev-001',
        name: 'Relax Intimate Kit',
        description: 'Kit discreto com itens suaves para conforto pessoal.',
        price: '49.90',
        status: 'ACTIVE' as const,
        internal: false,
        noindex: false,
        brandSlug: 'jofogo',
        categorySlugs: ['acessorios'],
        imageText: 'Produto+1',
        attributes: [
          { name: 'Tipo', value: 'Kit' },
          { name: 'Cor', value: 'Preto' }
        ]
      },
      {
        sku: 'JF-DEV-002',
        slug: 'produto-dev-002',
        name: 'Spray Refrescante',
        description: 'Spray leve para uso discreto em momentos de cuidado.',
        price: '39.90',
        status: 'OUT_OF_STOCK' as const,
        internal: false,
        noindex: false,
        brandSlug: 'sensuale-dev',
        categorySlugs: ['anesesicos'],
        imageText: 'Produto+2',
        attributes: [{ name: 'Volume', value: '50 ml' }]
      },
      {
        sku: 'JF-DEV-003',
        slug: 'produto-dev-003',
        name: 'Óleo Suave',
        description: 'Aroma delicado para criação de atmosfera acolhedora.',
        price: '59.90',
        status: 'INACTIVE' as const,
        internal: false,
        noindex: false,
        brandSlug: 'vivabem-dev',
        categorySlugs: ['produtos-comestiveis', 'lubrificantes'],
        imageText: 'Produto+3',
        attributes: [
          { name: 'Textura', value: 'Sedosa' },
          { name: 'Sabor', value: 'Neutro' }
        ]
      },
      {
        sku: 'JF-DEV-004',
        slug: 'produto-dev-004',
        name: 'Gel de Toque',
        description: 'Gel hidratante para toque mais suave e prolongado.',
        price: '29.90',
        status: 'ACTIVE' as const,
        internal: false,
        noindex: false,
        brandSlug: 'noturna-dev',
        categorySlugs: ['lubrificantes'],
        imageText: 'Produto+4',
        attributes: [{ name: 'Fórmula', value: 'Água' }]
      },
      {
        sku: 'JF-DEV-005',
        slug: 'produto-dev-005',
        name: 'Pérolas Térmicas',
        description: 'Pérolas com aquecimento suave para uso cuidadoso.',
        price: '79.90',
        status: 'ACTIVE' as const,
        internal: false,
        noindex: false,
        brandSlug: 'jofogo',
        categorySlugs: ['hot-balls'],
        imageText: 'Produto+5',
        attributes: [
          { name: 'Material', value: 'Silicone' },
          { name: 'Tamanho', value: 'Compacto' }
        ]
      },
      {
        sku: 'JF-DEV-006',
        slug: 'produto-dev-006',
        name: 'Toque Delicado',
        description: 'Dispositivo pensada para sensações leves e discretas.',
        price: '69.90',
        status: 'ACTIVE' as const,
        internal: false,
        noindex: false,
        brandSlug: 'sensuale-dev',
        categorySlugs: ['estimulantes-femininos'],
        imageText: 'Produto+6',
        attributes: [{ name: 'Intensidade', value: 'Suave' }]
      },
      {
        sku: 'JF-DEV-007',
        slug: 'produto-dev-007',
        name: 'Aroma Gentil',
        description: 'Líquido perfumado para momentos de atenção pessoal.',
        price: '34.90',
        status: 'ACTIVE' as const,
        internal: false,
        noindex: false,
        brandSlug: 'vivabem-dev',
        categorySlugs: ['estimulantes-masculinos'],
        imageText: 'Produto+7',
        attributes: [{ name: 'Fragrância', value: 'Suave' }]
      },
      {
        sku: 'JF-DEV-008',
        slug: 'produto-dev-008',
        name: 'Cuidados Essenciais',
        description: 'Produto para higiene leve e rotina de bem-estar.',
        price: '49.90',
        status: 'ACTIVE' as const,
        internal: false,
        noindex: false,
        brandSlug: 'noturna-dev',
        categorySlugs: ['cuidados-intimos'],
        imageText: 'Produto+8',
        attributes: [
          { name: 'Uso', value: 'Diário' },
          { name: 'pH', value: 'Neutro' }
        ]
      },
      {
        sku: 'JF-DEV-009',
        slug: 'produto-dev-009',
        name: 'Conexão Noturna',
        description: 'Dispositivo discreto para pequenos ajustes de conforto.',
        price: '129.90',
        status: 'ACTIVE' as const,
        internal: false,
        noindex: false,
        brandSlug: 'diversos',
        categorySlugs: ['acessorios', 'vibradores'],
        imageText: 'Produto+9',
        attributes: [{ name: 'Material', value: 'Aço leve' }]
      },
      {
        sku: 'JF-DEV-010',
        slug: 'produto-dev-010',
        name: 'Pulseira de Descanso',
        description: 'Acessório pensado para armazenamento discreto e cuidado.',
        price: '39.90',
        status: 'OUT_OF_STOCK' as const,
        internal: false,
        noindex: false,
        brandSlug: 'diversos',
        categorySlugs: ['acessorios'],
        imageText: 'Produto+10',
        attributes: [{ name: 'Material', value: 'Tecido' }]
      },
      {
        sku: 'JF-DEV-011',
        slug: 'produto-dev-011',
        name: 'Kit de Bem-estar',
        description: 'Conjunto delicado para cuidados pessoais em casa.',
        price: '99.90',
        status: 'INACTIVE' as const,
        internal: false,
        noindex: false,
        brandSlug: 'jofogo',
        categorySlugs: ['cuidados-intimos', 'lubrificantes'],
        imageText: 'Produto+11',
        attributes: [
          { name: 'Itens', value: '2 peças' },
          { name: 'Ação', value: 'Suave' }
        ]
      },
      {
        sku: 'JF-DEV-012',
        slug: 'produto-dev-012',
        name: 'Sessão Interna',
        description: 'Produto interno de desenvolvimento para fluxo protegido.',
        price: '199.90',
        status: 'ACTIVE' as const,
        internal: true,
        noindex: true,
        brandSlug: 'noturna-dev',
        categorySlugs: ['vibradores'],
        imageText: 'Produto+12',
        attributes: [
          { name: 'Controle', value: 'Silencioso' },
          { name: 'Potência', value: 'Moderada' }
        ]
      }
    ]

    await Promise.all(
      products.map((product, index) =>
        prisma.product.create({
          data: {
            sku: product.sku,
            slug: product.slug,
            name: product.name,
            description: product.description,
            price: product.price,
            status: product.status,
            internal: product.internal,
            noindex: product.noindex,
            brand: {
              connect: {
                id: brandMap[product.brandSlug].id
              }
            },
            categories: {
              create: product.categorySlugs.map((slug) => ({
                category: {
                  connect: { id: categoryMap[slug].id }
                }
              }))
            },
            images: {
              create: [
                {
                  url: `https://placehold.co/600x600/1e293b/f8fafc?text=${product.imageText}`,
                  altText: `${product.name} placeholder`,
                  position: 0
                }
              ]
            },
            attributes: {
              create: product.attributes
            }
          }
        })
      )
    )

    await prisma.adminUser.create({
      data: {
        email: 'admin@jofogo.dev',
        name: 'Admin Dev',
        passwordHash,
        role: 'ADMIN'
      }
    })
  })

  console.log('Seed finalizada com sucesso.')
}

main()
  .catch((error) => {
    console.error('Erro no seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
