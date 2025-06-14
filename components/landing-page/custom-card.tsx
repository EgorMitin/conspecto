import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import clsx from 'clsx';

type CardProps = React.ComponentProps<typeof Card>;
type CustomCardProps = CardProps & {
  cardHeader?: React.ReactNode;
  cardContent?: React.ReactNode;
  cardFooter?: React.ReactNode;
};

export default function CustomCard({ className, cardHeader, cardContent, cardFooter, ...props }: CustomCardProps) {
  return (
    <Card
      className={clsx('w-[380px]', className)}
      {...props}
    >
      <CardHeader>{cardHeader}</CardHeader>
      <CardContent className="grid gap-4">
        {cardContent}
      </CardContent>
      <CardFooter>{cardFooter}</CardFooter>
    </Card>
  );
}