import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { Certificate, CertificateStats, CertificateVerification } from './entities/certificate.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => Certificate)
export class CertificatesResolver {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Mutation(() => Certificate, { name: 'generateCertificate' })
  @UseGuards(JwtAuthGuard)
  generateCertificate(
    @CurrentUser() user: any,
    @Args('enrollmentId', { type: () => ID }) enrollmentId: string,
  ) {
    return this.certificatesService.generateCertificate(enrollmentId, user.id);
  }

  @Query(() => [Certificate], { name: 'myCertificates' })
  @UseGuards(JwtAuthGuard)
  getMyCertificates(@CurrentUser() user: any) {
    return this.certificatesService.getMyCertificates(user.id);
  }

  @Query(() => Certificate, { name: 'certificate' })
  @UseGuards(JwtAuthGuard)
  getCertificate(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.certificatesService.getCertificate(id, user.id);
  }

  @Query(() => CertificateVerification, { name: 'verifyCertificate' })
  verifyCertificate(@Args('certificateNumber') certificateNumber: string) {
    return this.certificatesService.verifyCertificate(certificateNumber);
  }

  @Query(() => CertificateStats, { name: 'certificateStats' })
  @UseGuards(JwtAuthGuard)
  getCertificateStats(@CurrentUser() user: any) {
    return this.certificatesService.getCertificateStats(user.id);
  }
}
