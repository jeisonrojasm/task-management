import { PrismaClient, ProjectStatus, TaskStatus, Priority } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Pure data creation — no deletes. Safe to run against an empty database.
// Reused by the conditional boot seed (prisma/seed-if-empty.ts).
export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  const platformRedesign = await prisma.project.create({
    data: {
      name: 'Modernización del Sistema de Recaudo',
      description:
        'Rediseño completo del motor de recaudo y sus APIs internas para mejorar la trazabilidad de transacciones, el rendimiento en picos de tráfico y la experiencia de los operadores de caseta.',
      status: ProjectStatus.ACTIVE,
    },
  });

  const apiIntegrationSprint = await prisma.project.create({
    data: {
      name: 'Sprint de Integración con Pasarelas de Pago',
      description:
        'Conectar la plataforma con nuevas pasarelas de pago y medios alternativos para ampliar la cobertura en peajes, parqueaderos y recaudo digital.',
      status: ProjectStatus.ACTIVE,
    },
  });

  const q3SecurityAudit = await prisma.project.create({
    data: {
      name: 'Auditoría de Cumplimiento PCI-DSS Q3',
      description:
        'Revisión trimestral de cumplimiento PCI-DSS que abarca flujos de autorización de pagos, vulnerabilidades en dependencias y políticas de acceso a datos de tarjetahabientes.',
      status: ProjectStatus.ARCHIVED,
    },
  });

  console.log('Created 3 projects');

  const criticalDueDate = new Date('2026-06-02');

  await prisma.task.createMany({
    data: [
      // TODO (3)
      {
        projectId: platformRedesign.id,
        title: 'Rediseñar modelo de datos para soporte multi-operador en peajes',
        description:
          'Actualizar el esquema para que una misma transacción pueda asociarse a múltiples operadores concesionarios con tarifas diferenciadas.',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
      },
      {
        projectId: platformRedesign.id,
        title: 'Implementar filtros avanzados en el panel de conciliación diaria',
        description:
          'Agregar filtros por rango de fechas, tipo de vehículo y estado de transacción en el dashboard de conciliación para administradores.',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
      },
      {
        projectId: platformRedesign.id,
        title: 'Documentar endpoints de recaudo en Swagger con ejemplos reales',
        description:
          'Actualizar la especificación OpenAPI con ejemplos de request y response basados en flujos reales de peaje electrónico.',
        status: TaskStatus.TODO,
        priority: Priority.LOW,
      },
      // IN_PROGRESS (2)
      {
        projectId: platformRedesign.id,
        title: 'Refactorizar motor de cálculo de tarifas de peaje',
        description:
          'Extraer la lógica de tarifación de los controladores HTTP y centralizarla en un servicio de dominio con cobertura de pruebas unitarias completa.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.CRITICAL,
      },
      {
        projectId: platformRedesign.id,
        title: 'Rediseñar interfaz del panel de gestión de casetas',
        description:
          'Implementar el nuevo diseño del panel de operadores con grilla responsiva, accesos rápidos a reportes y alertas de transacciones pendientes.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      // IN_REVIEW (2)
      {
        projectId: platformRedesign.id,
        title: 'Implementar paginación en el endpoint de historial de transacciones',
        description:
          'Reemplazar respuestas de lista completa por paginación basada en cursor para el historial de peajes, reduciendo la latencia en consultas históricas.',
        status: TaskStatus.IN_REVIEW,
        priority: Priority.HIGH,
      },
      {
        projectId: platformRedesign.id,
        title: 'Unificar manejo de errores en el gateway de recaudo',
        description:
          'Consolidar los bloques try-catch dispersos en el gateway en un único manejador centralizado con trazabilidad de errores y envoltorios estandarizados.',
        status: TaskStatus.IN_REVIEW,
        priority: Priority.MEDIUM,
      },
      // DONE (4)
      {
        projectId: platformRedesign.id,
        title: 'Configurar Prisma ORM con esquemas de peajes y transacciones',
        description:
          'Inicializar Prisma con PostgreSQL, definir los modelos de Transaction, Toll y Operator, y ejecutar la migración inicial del esquema de recaudo.',
        status: TaskStatus.DONE,
        priority: Priority.CRITICAL,
      },
      {
        projectId: platformRedesign.id,
        title: 'Establecer convenciones de código y pipeline de linting',
        description:
          'Configurar ESLint, Prettier y hooks de pre-commit con Husky para garantizar consistencia de estilo en todos los servicios del monorepo.',
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
      },
      {
        projectId: platformRedesign.id,
        title: 'Estructurar el monorepo de servicios de recaudo',
        description:
          'Inicializar los paquetes de backend, frontend y shared con rutas TypeScript correctas y configuraciones de build separadas por servicio.',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
      },
      {
        projectId: platformRedesign.id,
        title: 'Configurar Docker Compose para el entorno de desarrollo local',
        description:
          'Crear Dockerfiles multietapa para el backend de recaudo y el portal de operadores con un Compose que conecta PostgreSQL y el proxy Nginx.',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
      },
      // CANCELLED (1)
      {
        projectId: platformRedesign.id,
        title: 'Evaluar GraphQL para el módulo de consultas de historial',
        description:
          'Análisis exploratorio para reducir el over-fetching en reportes históricos — descartado al verificar que los endpoints REST paginados cubrían el caso de uso.',
        status: TaskStatus.CANCELLED,
        priority: Priority.LOW,
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      // TODO (1) - CRITICAL with due date
      {
        projectId: apiIntegrationSprint.id,
        title: 'Completar validación de firma de webhooks de la pasarela PSE',
        description:
          'Implementar verificación HMAC de los eventos entrantes de PSE para prevenir ataques de repetición y garantizar la integridad de las notificaciones de pago.',
        status: TaskStatus.TODO,
        priority: Priority.CRITICAL,
        dueDate: criticalDueDate,
      },
      // IN_PROGRESS (3)
      {
        projectId: apiIntegrationSprint.id,
        title: 'Integrar SDK de Wompi para pagos con tarjeta en parqueaderos',
        description:
          'Conectar el SDK de Wompi al flujo de cobro de parqueaderos para aceptar pagos con tarjeta débito y crédito en los puntos de salida.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      {
        projectId: apiIntegrationSprint.id,
        title: 'Construir adaptador para notificaciones de pago de Nequi',
        description:
          'Implementar la interfaz de adaptador para procesar las notificaciones push-to-pay de Nequi y sincronizar el estado del pago con el sistema de recaudo.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
      },
      {
        projectId: apiIntegrationSprint.id,
        title: 'Implementar canal de alertas en Slack para transacciones fallidas',
        description:
          'Publicar eventos de transacción fallida y reversiones en el canal de operaciones de Slack mediante Incoming Webhooks para visibilidad en tiempo real.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
      },
      // IN_REVIEW (2)
      {
        projectId: apiIntegrationSprint.id,
        title: 'Agregar autenticación OAuth2 al portal de operadores de peaje',
        description:
          'Permitir que los operadores se autentiquen mediante su proveedor corporativo usando el flujo Authorization Code con PKCE.',
        status: TaskStatus.IN_REVIEW,
        priority: Priority.HIGH,
      },
      {
        projectId: apiIntegrationSprint.id,
        title: 'Escribir pruebas de integración para el flujo de cobro en caseta',
        description:
          'Cubrir la iniciación del pago, la confirmación del webhook y la actualización del estado de paso con Supertest sobre base de datos de prueba.',
        status: TaskStatus.IN_REVIEW,
        priority: Priority.MEDIUM,
      },
      // DONE (2)
      {
        projectId: apiIntegrationSprint.id,
        title: 'Evaluar y seleccionar pasarela de pago principal',
        description:
          'Se compararon Wompi, PayU y Kushki contra requisitos de comisiones, disponibilidad y cobertura bancaria colombiana — se seleccionó Wompi.',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
      },
      {
        projectId: apiIntegrationSprint.id,
        title: 'Crear endpoints de gestión de llaves de API para operadores',
        description:
          'Implementar los endpoints para que los operadores generen, roten y revoquen sus llaves de API con alcance a su concesión.',
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      // DONE (4)
      {
        projectId: q3SecurityAudit.id,
        title: 'Auditar dependencias npm en busca de CVEs en servicios de pago',
        description:
          'Ejecutar npm audit y Snyk scan sobre los servicios de autorización y liquidación, priorizar hallazgos y actualizar los paquetes vulnerables.',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
      },
      {
        projectId: q3SecurityAudit.id,
        title: 'Revisar y rotar secretos de producción del gateway de pagos',
        description:
          'Inventariar las credenciales del gateway, rotar las llaves con más de 90 días de vigencia y migrar los secretos a AWS Secrets Manager.',
        status: TaskStatus.DONE,
        priority: Priority.CRITICAL,
      },
      {
        projectId: q3SecurityAudit.id,
        title: 'Fortalecer cabeceras de respuesta HTTP en las APIs de recaudo',
        description:
          'Validar la configuración de Helmet en las APIs públicas de peaje y agregar las directivas de seguridad faltantes según las guías OWASP.',
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
      },
      {
        projectId: q3SecurityAudit.id,
        title: 'Ejecutar prueba de penetración en endpoints de autorización de pago',
        description:
          'Probar los límites de consultas parametrizadas en los endpoints de autorización usando la metodología OWASP y documentar los hallazgos para el reporte PCI.',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
      },
      // CANCELLED (1)
      {
        projectId: q3SecurityAudit.id,
        title: 'Análisis de rate limiting granular por operador en endpoints de recaudo',
        description:
          'Se investigó limitado de velocidad por ID de operador — descartado al verificar que la configuración global de express-rate-limit cubría el requisito.',
        status: TaskStatus.CANCELLED,
        priority: Priority.MEDIUM,
      },
    ],
  });

  const taskCount = await prisma.task.count();
  console.log(`Created 3 projects and ${taskCount} tasks`);
}

// Destructive regenerate: wipe, then reseed. This is what `pnpm db:seed` runs (manual tool).
async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    console.log('Database cleaned');
    await seedDatabase(prisma);
    console.log('Seed completed successfully');
  } finally {
    await prisma.$disconnect();
  }
}

// Run only when executed directly (e.g. `prisma db seed`), never when imported.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
