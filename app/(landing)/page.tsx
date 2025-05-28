'use client'

import TitleSection from '@/components/landing-page/title-section'
import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { PRICING_PLANS, PRICING_CARDS } from '@/lib/constants'
import CustomCard from '@/components/landing-page/custom-card'
import { CardTitle, CardContent } from '@/components/ui/card'
import Diamond from '../../public/icons/diamond.svg';
import CheckIcon from '../../public/icons/check.svg';
import clsx from 'clsx'
import ScrollHighlightEditor from '@/components/landing-page/scroll-highlight-editor'

const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef}>
      <section
        className='overflow-hidden pt-10 sm:flex sm:flex-col gap-4 md:items-center md:justify-center'
      >
        <TitleSection
          pill='The plot twist your brain didn’t see coming.'
          title='Conspecto – Notes Reimagined: Capture, Question, Master'
        />
        <div
          className="
          p-[2px]
          mt-6
          rounded-xl
          bg-gradient-to-r
          from-primary
          to-blue-600
          sm:w-[300px]
        "
        >
          <Button
            variant="secondary"
            className="
            w-full
            rounded-[10px]
            p-6
            text-md
            bg-background
          "
          >
            Start Making Notes That Fight Back
          </Button>
        </div>
        <div
          className="md:mt-[90px]
          flex
          justify-center
          items-center
          mt-[40px]
          relative
        "
        >
          <ScrollHighlightEditor page={containerRef} />
          <div
            className="bottom-0
            top-[70%]
            bg-gradient-to-t
            from-background
            left-0
            right-0
            absolute
            z--10
          "
          ></div>
        </div>
      </section>
      <section
        className="mt-20
        px-4
        sm:px-6
      "
      >
        <TitleSection
          title="The Perfect Plan For You"
          subheading="Experience all the benefits of our platform. Select a plan that suits your needs and take your productivity to new heights."
          pill="Pricing"
        />
        <div
          className="flex 
        flex-col-reverse
        sm:flex-row
        gap-4
        justify-center
        sm:items-stretch
        items-center
        mt-10
        "
        >
          {PRICING_CARDS.map((card) => (
            <CustomCard
              key={card.planType}
              className={clsx(
                'w-[300px] rounded-2xl dark:bg-black/40 background-blur-3xl relative',
                {
                  'border-amber-200/70':
                    card.planType === PRICING_PLANS.proplan,
                }
              )}
              cardHeader={
                <CardTitle
                  className="text-2xl
                  font-semibold
              "
                >
                  {card.planType === PRICING_PLANS.proplan && (
                    <>
                      <div
                        className="hidden dark:block w-full blur-[120px] rounded-full h-32
                        absolute
                        bg-yellow-100/80
                        -z-10
                        top-0
                      "
                      />
                      <Image
                        src={Diamond}
                        alt="Pro Plan Icon"
                        className="absolute top-6 right-6"
                      />
                    </>
                  )}
                  {card.planType}
                </CardTitle>
              }
              cardContent={
                <CardContent className="p-0">
                  <span
                    className="font-normal 
                    text-2xl
                "
                  >
                    ${card.price}
                  </span>
                  {+card.price > 0 ? (
                    <span className="dark:text-orange-400 ml-1">
                      /mo
                    </span>
                  ) : (
                    ''
                  )}
                  <p className="dark:text-washed-purple-800">
                    {card.description}
                  </p>
                  <Button
                    variant="default"
                    className="whitespace-nowrap w-full mt-4"
                  >
                    {card.planType === PRICING_PLANS.proplan
                      ? 'Go Pro'
                      : 'Get Started'}
                  </Button>
                </CardContent>
              }
              cardFooter={
                <ul
                  className="font-normal
                  flex
                  mb-2
                  flex-col
                  gap-4
                "
                >
                  <small>{card.highlightFeature}</small>
                  {card.freatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex
                      items-center
                      gap-2
                    "
                    >
                      <Image
                        src={CheckIcon}
                        alt="Check Icon"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing