import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationSchema = new ZodValidationPipe(pageQueryParamsSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamsSchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Query('page', queryValidationSchema) query: PageQueryParamSchema,
  ) {
    const perPage = 1
    const questions = await this.prisma.question.findMany({
      take: perPage,
      skip: (query - 1) * perPage,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      questions,
    }
  }
}
