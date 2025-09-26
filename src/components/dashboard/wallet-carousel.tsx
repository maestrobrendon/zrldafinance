import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { wallets } from "@/lib/data";

export default function WalletCarousel() {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {wallets.map((wallet) => (
          <CarouselItem key={wallet.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{wallet.name}</span>
                    <span
                      className={`h-4 w-4 rounded-full ${wallet.color}`}
                    ></span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-2xl font-bold tracking-tight">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: wallet.currency,
                    }).format(wallet.balance)}
                  </p>
                  {wallet.goal && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>Goal</span>
                        <span>
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: wallet.currency,
                          }).format(wallet.goal)}
                        </span>
                      </div>
                      <Progress
                        value={(wallet.balance / wallet.goal) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
