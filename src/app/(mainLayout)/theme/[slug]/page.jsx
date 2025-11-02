"use client";
import BagHomePageForm from "@/components/homePages/bagHomePage";
import BeautyHomePageForm from "@/components/homePages/beautyHomePage";
import BicycleHomePageForm from "@/components/homePages/bicycleHomePage";
import BooksHomePageForm from "@/components/homePages/booksHomePage";
import ChristmasHomePageForm from "@/components/homePages/christmasHomePage";
import DigitalDownloadForm from "@/components/homePages/digitalDownload";
import ElectronicsOneForm from "@/components/homePages/electronicsOne";
import ElectronicsThreeForm from "@/components/homePages/electronicsThree";
import ElectronicsTwoForm from "@/components/homePages/electronicsTwo";
import FashionFiveForm from "@/components/homePages/fashionFive";
import FashionFourForm from "@/components/homePages/fashionFour";
import FashionOneForm from "@/components/homePages/fashionOne";
import FashionSevenForm from "@/components/homePages/fashionSeven";
import FashionSixForm from "@/components/homePages/fashionSix";
import FashionThreeForm from "@/components/homePages/fashionThree";
import FashionTwoForm from "@/components/homePages/fashionTwo";
import FlowerHomePageForm from "@/components/homePages/flowerHomePage";
import FullHomePageForm from "@/components/homePages/fullHomePage";
import FurnitureDarkForm from "@/components/homePages/furnitureDark";
import FurnitureOneForm from "@/components/homePages/furnitureOne";
import FurnitureTwoForm from "@/components/homePages/furnitureTwo";
import GameHomePageForm from "@/components/homePages/gameHomePage";
import GogglesHomePageForm from "@/components/homePages/gogglesHomePage";
import GradientHomePageForm from "@/components/homePages/gradientHomePage";
import GymHomePageForm from "@/components/homePages/gymHomePage";
import JewelleryOneForm from "@/components/homePages/jewelleryOne";
import JewelleryThreeForm from "@/components/homePages/jewelleryThree";
import JewelleryTwoForm from "@/components/homePages/jewelleryTwo";
import KidsHomePageForm from "@/components/homePages/kidsHomePage";
import MarijuanaHomePageForm from "@/components/homePages/marijuanaHomePage";
import MarketplaceFourForm from "@/components/homePages/marketplaceFour";
import MarketplaceOneForm from "@/components/homePages/marketplaceOne";
import MarketplaceThreeForm from "@/components/homePages/marketplaceThree";
import MarketplaceTwoForm from "@/components/homePages/marketplaceTwo";
import MedicalHomePageForm from "@/components/homePages/medicalHomePage";
import NurseryHomePageForm from "@/components/homePages/nurseryHomePage";
import ParallaxHomePageForm from "@/components/homePages/parallaxHomePage";
import PerfumeHomePageForm from "@/components/homePages/perfumeHomepage";
import PetsHomePageForm from "@/components/homePages/petsHomePage";
import ShoesHomePageForm from "@/components/homePages/shoesHomePage";
import SurfingHomePageForm from "@/components/homePages/surfingHomePage";
import ToolsHomePageForm from "@/components/homePages/toolsHomePage";
import VegetableFourForm from "@/components/homePages/vegetableFour";
import VegetableOneForm from "@/components/homePages/vegetableOne";
import VegetableThreeForm from "@/components/homePages/vegetableThree";
import VegetableTwoForm from "@/components/homePages/vegetableTwo";
import VideoHomePageForm from "@/components/homePages/videoHomePage";
import VideoSliderForm from "@/components/homePages/videoSlider";
import WatchHomePageForm from "@/components/homePages/watchHomepage";
import YogaHomePageForm from "@/components/homePages/yogaHomePage";
import request from "@/utils/axiosUtils";
import { BrandAPI, Category, attribute, blog } from "@/utils/axiosUtils/API";
import { titleCreate } from "@/utils/customFunctions/TitleCreate";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const homePages = () => {
  const params = useParams()
  const [title, setTitle] = useState("");
  const { data: blogData } = useCustomQuery([blog], () => request({ url: blog }), {
    refetchOnWindowFocus: false,
    select: (res) =>
      res?.data?.data.map((elem) => {
        return { id: elem.id, name: elem.title, slug: elem?.slug };
      }),
  });

  const { data: brandData, isLoading: brandLoader } = useCustomQuery([BrandAPI], () => request({ url: BrandAPI }), {
    refetchOnWindowFocus: false,
    select: (res) =>
      res?.data?.data.map((elem) => {
        return { id: elem.id, name: elem.name };
      }),
  });

  const { data: attributeData } = useCustomQuery([attribute], () => request({ url: attribute }), {
    refetchOnWindowFocus: false,
    select: (res) =>
      res?.data?.data.map((elem) => {
        return { id: elem.id, name: elem.name };
      }),
  });

  const {
    data: categoryData,
    isLoading: categoryLoader,
    refetch: categoryRefetch,
  } = useCustomQuery([Category], () => request({ url: Category, params: { type: "product" } }), {
    enabled: true,
    refetchOnWindowFocus: false,
    select: (res) =>
      res?.data?.data?.map((elem) => {
        return { subcategories: elem.subcategories, id: elem.id, name: elem.name, image: elem?.category_icon?.original_url || "/assets/images/placeholder.png", slug: elem?.slug };
      }),
  });

  const apiData = {
    categoryData: categoryData,
    categoryLoader: categoryLoader,
    categoryRefetch: categoryRefetch,
    brandData: brandData,
    brandLoader: brandLoader,
    blogData: blogData,
    attributeData: attributeData,
  };

  useEffect(() => {
    titleCreate(params.slug, setTitle);
  }, [params]);

  const homePageOptions = {
    fashion_one: <FashionOneForm title={title} apiData={apiData} />,
    fashion_two: <FashionTwoForm title={title} apiData={apiData} />,
    fashion_three: <FashionThreeForm title={title} apiData={apiData} />,
    fashion_four: <FashionFourForm title={title} apiData={apiData} />,
    fashion_five: <FashionFiveForm title={title} apiData={apiData} />,
    fashion_six: <FashionSixForm title={title} apiData={apiData} />,
    fashion_seven: <FashionSevenForm title={title} apiData={apiData} />,
    electronics_one: <ElectronicsOneForm title={title} apiData={apiData} />,
    electronics_two: <ElectronicsTwoForm title={title} apiData={apiData} />,
    electronics_three: <ElectronicsThreeForm title={title} apiData={apiData} />,
    furniture_one: <FurnitureOneForm title={title} apiData={apiData} />,
    furniture_two: <FurnitureTwoForm title={title} apiData={apiData} />,
    furniture_dark: <FurnitureDarkForm title={title} apiData={apiData} />,
    jewellery_one: <JewelleryOneForm title={title} apiData={apiData} />,
    jewellery_two: <JewelleryTwoForm title={title} apiData={apiData} />,
    jewellery_three: <JewelleryThreeForm title={title} apiData={apiData} />,
    marketplace_one: <MarketplaceOneForm title={title} apiData={apiData} />,
    marketplace_two: <MarketplaceTwoForm title={title} apiData={apiData} />,
    marketplace_three: <MarketplaceThreeForm title={title} apiData={apiData} />,
    marketplace_four: <MarketplaceFourForm title={title} apiData={apiData} />,
    vegetables_one: <VegetableOneForm title={title} apiData={apiData} />,
    vegetables_two: <VegetableTwoForm title={title} apiData={apiData} />,
    vegetables_three: <VegetableThreeForm title={title} apiData={apiData} />,
    vegetables_four: <VegetableFourForm title={title} apiData={apiData} />,
    perfume: <PerfumeHomePageForm title={title} apiData={apiData} />,
    full_page: <FullHomePageForm title={title} apiData={apiData} />,
    parallax: <ParallaxHomePageForm title={title} apiData={apiData} />,
    medical: <MedicalHomePageForm title={title} apiData={apiData} />,
    pets: <PetsHomePageForm title={title} apiData={apiData} />,
    bag: <BagHomePageForm title={title} apiData={apiData} />,
    yoga: <YogaHomePageForm title={title} apiData={apiData} />,
    christmas: <ChristmasHomePageForm title={title} apiData={apiData} />,
    bicycle: <BicycleHomePageForm title={title} apiData={apiData} />,
    watch: <WatchHomePageForm title={title} apiData={apiData} />,
    nursery: <NurseryHomePageForm title={title} apiData={apiData} />,
    video: <VideoHomePageForm title={title} apiData={apiData} />,
    kids: <KidsHomePageForm title={title} apiData={apiData} />,
    books: <BooksHomePageForm title={title} apiData={apiData} />,
    game: <GameHomePageForm title={title} apiData={apiData} />,
    beauty: <BeautyHomePageForm title={title} apiData={apiData} />,
    marijuana: <MarijuanaHomePageForm title={title} apiData={apiData} />,
    gym: <GymHomePageForm title={title} apiData={apiData} />,
    tools: <ToolsHomePageForm title={title} apiData={apiData} />,
    shoes: <ShoesHomePageForm title={title} apiData={apiData} />,
    goggles: <GogglesHomePageForm title={title} apiData={apiData} />,
    flower: <FlowerHomePageForm title={title} apiData={apiData} />,
    video_slider: <VideoSliderForm title={title} apiData={apiData} />,
    gradient: <GradientHomePageForm title={title} apiData={apiData} />,
    left_sidebar: <SurfingHomePageForm title={title} apiData={apiData} />,
    digital_download: <DigitalDownloadForm title={title} apiData={apiData} />,
  };

  return <>{homePageOptions[params.slug]}</>;
};

export default homePages;
