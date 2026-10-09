import { prisma } from "@/lib/prisma";


interface Props {
    searchParams: Promise<{ category?: string; q?: string }>;
  }
  
  export default async function ReservationPage({ searchParams }: Props) {
    const { category, q } = await searchParams;
  
    const reservations = await prisma.reservation.findMany({
        //recherche par nom de voyage
        where: {
            voyage: {
                title: {
                    contains: q,
                    mode: "insensitive"
                }
            }
        }
    });

    return (
        <div>
            <h1>Réservations</h1>
        </div>
    )
  }