import { Star } from "lucide-react";

interface Review {
  id: string;
  authorName: string;
  authorImage: string | null;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  createdAt: Date;
}

export function VoyageReviews({ reviews, rating }: { reviews: Review[]; rating: number }) {
  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    percentage: reviews.length
      ? (reviews.filter((rev) => rev.rating === r).length / reviews.length) * 100
      : 0,
  }));

  return (
    <div>
      <h2 className="font-serif text-3xl text-white mb-8">Avis voyageurs</h2>

      {reviews.length === 0 ? (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center">
          <p className="text-white/40">Aucun avis pour ce voyage pour le moment.</p>
          <p className="text-white/20 text-sm mt-1">Soyez le premier à partager votre expérience !</p>
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 mb-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="text-center">
              <p className="font-serif text-6xl text-white font-light">{rating}</p>
              <div className="flex gap-1 justify-center my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-4 h-4 text-[#C9A84C]"
                    fill={s <= Math.round(rating) ? "#C9A84C" : "none"}
                  />
                ))}
              </div>
              <p className="text-white/40 text-sm">{reviews.length} avis</p>
            </div>

            <div className="flex-1 space-y-2 w-full">
              {ratingDistribution.map((r) => (
                <div key={r.stars} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-4">{r.stars}</span>
                  <Star className="w-3 h-3 text-[#C9A84C]" fill="#C9A84C" />
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A84C] rounded-full transition-all"
                      style={{ width: `${r.percentage}%` }}
                    />
                  </div>
                  <span className="text-white/30 text-xs w-4">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#111111] border border-white/5 hover:border-[#C9A84C]/20 rounded-2xl p-5 transition-colors"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-3.5 h-3.5 text-[#C9A84C]"
                      fill={s <= review.rating ? "#C9A84C" : "none"}
                    />
                  ))}
                </div>

                <h4 className="font-serif text-base text-white mb-2">{review.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">
                  {review.content}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                      <span className="text-[#C9A84C] text-xs font-semibold">
                        {review.authorName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{review.authorName}</p>
                      {review.verified && (
                        <p className="text-green-400 text-xs">✓ Voyage vérifié</p>
                      )}
                    </div>
                  </div>
                  <span className="text-white/20 text-xs">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
